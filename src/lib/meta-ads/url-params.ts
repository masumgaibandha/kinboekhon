// Meta fills these {{...}} macros with the campaign, ad set and ad ids; orders are matched to ads by utm_content.
export const AD_URL_PARAMS =
  "utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.id}}&utm_term={{adset.id}}&utm_content={{ad.id}}";
