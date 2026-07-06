-- Run this once if local Sequelize sync previously failed with:
-- "Too many keys specified; max 64 keys allowed".
--
-- It removes duplicate unique indexes that Sequelize alter mode may have
-- repeatedly created on products.slug and products.sku, keeping one per column.

SET @schema_name = DATABASE();

DROP TEMPORARY TABLE IF EXISTS duplicate_product_indexes;
CREATE TEMPORARY TABLE duplicate_product_indexes AS
SELECT index_name
FROM information_schema.statistics
WHERE table_schema = @schema_name
  AND table_name = 'products'
  AND non_unique = 0
  AND column_name IN ('slug', 'sku')
  AND index_name NOT IN ('PRIMARY', 'slug', 'sku')
GROUP BY index_name;

SET SESSION group_concat_max_len = 100000;

SELECT GROUP_CONCAT(CONCAT('ALTER TABLE products DROP INDEX `', index_name, '`') SEPARATOR '; ')
INTO @drop_indexes
FROM duplicate_product_indexes;

SET @drop_indexes = IFNULL(@drop_indexes, 'SELECT \"No duplicate product indexes found\"');
PREPARE stmt FROM @drop_indexes;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
