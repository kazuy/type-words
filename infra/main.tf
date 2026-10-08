resource "cloudflare_r2_bucket" "words" {
  account_id = var.cloudflare_account_id
  name       = var.words_bucket_name

  jurisdiction  = "default"
  storage_class = "Standard"

  lifecycle {
    prevent_destroy = true
  }
}

resource "cloudflare_r2_managed_domain" "words" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.words.name

  enabled = false
}
