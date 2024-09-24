-- AlterTable
ALTER TABLE "mst_tenants" ADD COLUMN     "notice_string" TEXT;

-- CreateTable
CREATE TABLE "mst_users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mst_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tx_tenant_books" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tx_tenant_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tx_rental_histories" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tx_rental_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tx_book_reviews" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tx_book_reviews_pkey" PRIMARY KEY ("id")
);
