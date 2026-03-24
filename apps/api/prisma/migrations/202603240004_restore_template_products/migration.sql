UPDATE "Product"
SET "productStatus" = 'APPROVED'
WHERE "slug" IN (
  'radiance-vitamin-c-serum',
  'hydra-calm-moisturizer',
  'velvet-matte-lipstick',
  'lash-lift-mascara',
  'silk-repair-hair-mask',
  'amber-bloom-eau-de-parfum'
);
