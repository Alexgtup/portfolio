const MP_SHEETS = {
  SETTINGS: 'НАСТРОЙКИ',
  CATALOG: 'КАТАЛОГ',
  HISTORY: 'ИСТОРИЯ',
};

const OZON_BASE = 'https://api-seller.ozon.ru';
const WB_BASE = 'https://discounts-prices-api.wildberries.ru';
const YM_BASE = 'https://api.partner.market.yandex.ru';

function mp_run_daily() {
  const ss = SpreadsheetApp.getActive();
  const tz = mp_get_timezone_(ss) || Session.getScriptTimeZone();
  const now = new Date();

  const cabinets = mp_read_cabinets_(ss);
  if (!cabinets.length) throw new Error('в "настройки" нет включённых кабинетов');

  // снапшот пишем в каталог + историю
  const allCatalogUpserts = [];
  const allHistoryRows = [];

  cabinets.forEach(cab => {
    const creds = mp_get_creds_(cab);
    if (!creds) throw new Error(`нет токенов для ${cab.marketplace}/${cab.code} (проверь script properties)`);

    let items = [];
    if (cab.marketplace === 'OZON') items = mp_fetch_ozon_(creds, cab);
    if (cab.marketplace === 'WB') items = mp_fetch_wb_(creds, cab);
    if (cab.marketplace === 'YM') items = mp_fetch_ym_(creds, cab);

    items.forEach(p => {
      // catalog upsert row (A..L)
      allCatalogUpserts.push([
        cab.marketplace,            // маркетплейс
        cab.code,                   // код кабинета
        p.mpId || '',               // id товара в мп
        p.offerKey || '',           // ключ (offer_id / vendorCode / offerId)
        p.name || '',               // название
        p.brand || '',              // бренд
        p.barcodes || '',           // штрихкоды
        p.url || '',                // ссылка
        'активен',                  // статус
        now,                        // дата обновления
        '',                         // дата первого появления (заполним если пусто)
        ''                          // примечание
      ]);

      // history row (A..N)
      allHistoryRows.push([
        mp_date_only_(now, tz),     // дата
        now,                        // дата снимка
        cab.marketplace,            // маркетплейс
        cab.code,                   // кабинет
        p.mpId || '',               // id товара в мп
        p.offerKey || '',           // ваш ключ
        p.name || '',               // название
        p.currency || 'RUB',        // валюта
        p.price || '',              // цена (витрина/факт по api)
        p.oldPrice || '',           // старая цена
        '',                         // скидка % (формула в листе)
        p.sppFrac ?? '',            // spp % (0.05 = 5%)
        '',                         // цена после spp (формула в листе)
        p.comment || ''             // комментарий/источник
      ]);
    });
  });

  mp_catalog_upsert_(ss, allCatalogUpserts, now);
  mp_history_append_dedup_(ss, allHistoryRows, tz);

  return { ok: true, cabinets: cabinets.length, rows: allHistoryRows.length };
}

/* ---------------- settings ---------------- */

function mp_get_timezone_(ss) {
  const sh = ss.getSheetByName(MP_SHEETS.SETTINGS);
  // в шаблоне таймзона лежит в B3
  const v = sh.getRange('B3').getValue();
  return (v && String(v).trim()) ? String(v).trim() : '';
}

function mp_read_cabinets_(ss) {
  const sh = ss.getSheetByName(MP_SHEETS.SETTINGS);
  const startRow = 9;
  const lastRow = sh.getLastRow();
  if (lastRow < startRow) return [];

  const rng = sh.getRange(startRow, 1, lastRow - startRow + 1, 5).getValues(); // a..e
  const out = [];
  rng.forEach(r => {
    const marketplace = (r[0] || '').toString().trim().toUpperCase();
    const code = (r[1] || '').toString().trim();
    const enabled = (r[4] === true) || (String(r[4]).toLowerCase().trim() === 'true');
    if (!marketplace || !code || !enabled) return;
    out.push({ marketplace, code });
  });
  return out;
}

function mp_get_creds_(cab) {
  const props = PropertiesService.getScriptProperties();
  const mp = cab.marketplace;

  if (mp === 'OZON') {
    const clientId = props.getProperty(`ozon.${cab.code}.client_id`);
    const apiKey = props.getProperty(`ozon.${cab.code}.api_key`);
    if (!clientId || !apiKey) return null;
    return { clientId, apiKey };
  }

  if (mp === 'WB') {
    const token = props.getProperty(`wb.${cab.code}.token`);
    if (!token) return null;
    return { token };
  }

  if (mp === 'YM') {
    const apiKey = props.getProperty(`ym.${cab.code}.api_key`);
    const campaignId = props.getProperty(`ym.${cab.code}.campaign_id`) || '';
    if (!apiKey) return null;
    return { apiKey, campaignId };
  }

  return null;
}

/* ---------------- ozon ----------------
   берём marketing_price (витрина) + old_price + price из /v3/product/info/list
   product ids получаем через /v3/product/list (пагинация last_id/limit до 1000). :contentReference[oaicite:2]{index=2}
-------------------------------------- */

function mp_fetch_ozon_(creds, cab) {
  const list = mp_ozon_list_all_(creds);
  const productIds = list.map(x => x.product_id);
  const offerByProduct = new Map(list.map(x => [String(x.product_id), x.offer_id]));

  const details = [];
  const chunkSize = 1000;
  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);
    const resp = mp_ozon_post_(creds, '/v3/product/info/list', { product_id: chunk });
    const items = (resp.items || resp.result?.items || resp.result || resp?.items || []);
    (items || []).forEach(it => details.push(it));
  }

  return details.map(it => {
    const mpId = String(it.id ?? it.product_id ?? '');
    const offerKey = String(it.offer_id ?? offerByProduct.get(mpId) ?? '');
    const price = mp_to_number_(it.marketing_price ?? it.marketingPrice ?? it.price ?? '');
    const oldPrice = mp_to_number_(it.old_price ?? it.oldPrice ?? '');
    const currency = String(it.currency_code ?? it.currencyCode ?? 'RUB');

    return {
      mpId,
      offerKey,
      name: it.name || '',
      brand: '',
      barcodes: Array.isArray(it.barcodes) ? it.barcodes.join(',') : '',
      url: offerKey ? `https://www.ozon.ru/search/?text=${encodeURIComponent(offerKey)}` : '',
      currency,
      price,
      oldPrice,
      sppFrac: '', // у ozon “spp” как в wb нет
      comment: it.price ? `кабинетная price=${it.price}` : ''
    };
  });
}

function mp_ozon_list_all_(creds) {
  const out = [];
  let lastId = '';
  const limit = 1000;

  while (true) {
    const body = {
      filter: { visibility: 'ALL' },
      last_id: lastId,
      limit
    };

    const resp = mp_ozon_post_(creds, '/v3/product/list', body);
    const res = resp.result || resp;
    const items = res.items || [];
    items.forEach(it => out.push({ product_id: it.product_id, offer_id: it.offer_id, archived: it.archived }));
    if (!res.last_id || !items.length) break;
    lastId = res.last_id;
    if (items.length < limit) break;
  }
  return out;
}

function mp_ozon_post_(creds, path, payload) {
  const url = OZON_BASE + path;
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'Client-Id': String(creds.clientId),
      'Api-Key': String(creds.apiKey),
    },
    payload: JSON.stringify(payload || {}),
  });

  const code = resp.getResponseCode();
  const txt = resp.getContentText();
  if (code < 200 || code >= 300) throw new Error(`ozon ${path} http ${code}: ${txt}`);

  return JSON.parse(txt);
}

/* ---------------- wb ----------------
   берём price / discountedPrice / clubDiscount / clubDiscountedPrice из /api/v2/list/goods/filter. :contentReference[oaicite:3]{index=3}
------------------------------------ */

function mp_fetch_wb_(creds, cab) {
  const token = String(creds.token || '').replace(/\s+/g, '');
  const limit = 1000;
  let offset = 0;

  const out = [];

  while (true) {
    const url = `${WB_BASE}/api/v2/list/goods/filter?limit=${limit}&offset=${offset}`;
    const resp = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { Authorization: token },
    });

    const code = resp.getResponseCode();
    const txt = resp.getContentText();
    if (code < 200 || code >= 300) throw new Error(`wb list/goods/filter http ${code}: ${txt}`);

    const data = JSON.parse(txt);
    const goods = data.data?.listGoods || [];

    if (!goods.length) break;

    goods.forEach(g => {
      const nmId = String(g.nmID ?? g.nmId ?? '');
      const vendorCode = String(g.vendorCode ?? '');
      const clubDiscount = (g.clubDiscount ?? '');

      // чтобы не плодить строки по размерам - берём минимальную discountedPrice
      let best = null;
      (g.sizes || []).forEach(sz => {
        const discounted = mp_to_number_(sz.discountedPrice ?? '');
        if (discounted === '') return;
        if (!best || discounted < best.discounted) {
          best = {
            discounted,
            price: mp_to_number_(sz.price ?? ''),
            clubPrice: mp_to_number_(sz.clubDiscountedPrice ?? ''),
          };
        }
      });

      if (!nmId) return;

      out.push({
        mpId: nmId,
        offerKey: vendorCode,
        name: '',
        brand: '',
        barcodes: '',
        url: `https://www.wildberries.ru/catalog/${encodeURIComponent(nmId)}/detail.aspx`,
        currency: g.currencyIsoCode4217 || 'RUB',
        price: best ? best.discounted : '',
        oldPrice: best ? best.price : '',
        sppFrac: (clubDiscount === '' || clubDiscount === null || clubDiscount === undefined) ? '' : (Number(clubDiscount) / 100),
        comment: best && best.clubPrice ? `club_price=${best.clubPrice}` : ''
      });
    });

    offset += limit; // по доке offset = offset + limit :contentReference[oaicite:1]{index=1}
  }

  return out;
}


/* ---------------- ymarket ----------------
   цены по offer ids: POST /v2/campaigns/{campaignId}/offer-prices, токен в заголовок Api-Key. :contentReference[oaicite:4]{index=4}
----------------------------------------- */

function mp_fetch_ym_(creds, cab) {
  const campaignId = creds.campaignId || mp_ym_first_campaign_(creds);
  if (!campaignId) throw new Error(`ymarket: не нашёл campaign_id для ${cab.code}`);

  let pageToken = '';
  const limit = 200;
  const out = [];

  while (true) {
    const url = `${YM_BASE}/v2/campaigns/${encodeURIComponent(campaignId)}/offer-prices`;
    const body = pageToken ? { page_token: pageToken, limit } : { limit };

    const resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: { 'Api-Key': String(creds.apiKey) },
      payload: JSON.stringify(body),
    });

    const code = resp.getResponseCode();
    const txt = resp.getContentText();
    if (code < 200 || code >= 300) throw new Error(`ymarket offer-prices http ${code}: ${txt}`);

    const data = JSON.parse(txt);
    const offers = data.result?.offers || [];
    offers.forEach(o => {
      const offerId = String(o.offerId || '');
      const price = mp_to_number_(o.price?.value ?? '');
      const oldPrice = mp_to_number_(o.oldPrice?.value ?? '');
      out.push({
        mpId: offerId,
        offerKey: offerId,
        name: o.name || '',
        brand: '',
        barcodes: '',
        url: offerId ? `https://market.yandex.ru/search?text=${encodeURIComponent(offerId)}` : '',
        currency: (o.price?.currency || 'RUB'),
        price,
        oldPrice,
        sppFrac: '',
        comment: ''
      });
    });

    pageToken = data.result?.paging?.nextPageToken || '';
    if (!pageToken) break;
  }

  return out;
}

function mp_ym_first_campaign_(creds) {
  const url = `${YM_BASE}/v2/campaigns`;
  const resp = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: { 'Api-Key': String(creds.apiKey) },
  });

  const code = resp.getResponseCode();
  const txt = resp.getContentText();
  if (code < 200 || code >= 300) throw new Error(`ymarket campaigns http ${code}: ${txt}`);

  const data = JSON.parse(txt);
  const c = data.campaigns?.[0]?.id || data.result?.campaigns?.[0]?.id || '';
  return c ? String(c) : '';
}

/* ---------------- writes ---------------- */

function mp_catalog_upsert_(ss, upserts, now) {
  if (!upserts.length) return;
  const sh = ss.getSheetByName(MP_SHEETS.CATALOG);

  // читаем существующий каталог в map по ключу "маркетплейс|кабинет|id"
  const lastRow = sh.getLastRow();
  const existing = new Map();

  if (lastRow > 1) {
    const values = sh.getRange(2, 1, lastRow - 1, 12).getValues();
    values.forEach((r, idx) => {
      const mp = String(r[0] || '');
      const cab = String(r[1] || '');
      const id = String(r[2] || '');
      const key = `${mp}|${cab}|${id}`;
      if (mp && cab && id) existing.set(key, { row: idx + 2, firstSeen: r[10] });
    });
  }

  const toAppend = [];
  upserts.forEach(r => {
    const key = `${r[0]}|${r[1]}|${r[2]}`;
    const hit = existing.get(key);
    if (hit) {
      // обновляем строку (кроме firstSeen если уже есть)
      const row = hit.row;
      if (!hit.firstSeen) r[10] = now;
      else r[10] = hit.firstSeen;
      sh.getRange(row, 1, 1, 12).setValues([r]);
    } else {
      r[10] = now;
      toAppend.push(r);
    }
  });

  if (toAppend.length) {
    sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, 12).setValues(toAppend);
  }
}

function mp_history_append_dedup_(ss, rows, tz) {
  if (!rows.length) return;
  const sh = ss.getSheetByName(MP_SHEETS.HISTORY);

  const dateStr = rows[0][0]; // yyyy-mm-dd
  const existingKeys = mp_history_keys_for_date_(sh, dateStr);

  const filtered = rows.filter(r => {
    const key = `${r[0]}|${r[2]}|${r[3]}|${r[4]}`; // дата|мп|кабинет|id
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  if (!filtered.length) return;

  sh.getRange(sh.getLastRow() + 1, 1, filtered.length, 14).setValues(filtered);
}

function mp_history_keys_for_date_(sh, dateStr) {
  const out = new Set();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return out;

  // берём хвост, чтобы не читать весь лист
  const take = Math.min(5000, lastRow - 1);
  const values = sh.getRange(lastRow - take + 1, 1, take, 5).getValues(); // A..E
  values.forEach(r => {
    const d = r[0];
    const ds = (d instanceof Date) ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(d);
    if (ds !== dateStr) return;
    const key = `${dateStr}|${r[2]}|${r[3]}|${r[4]}`;
    out.add(key);
  });
  return out;
}

/* ---------------- utils ---------------- */

function mp_date_only_(dt, tz) {
  return Utilities.formatDate(dt, tz, 'yyyy-MM-dd');
}

function mp_to_number_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\s/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : '';
}
