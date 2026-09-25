CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`product_id` text,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`payment_method` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`cost` real NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'in_stock' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);