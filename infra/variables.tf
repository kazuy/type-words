variable "cloudflare_account_id" {
  description = "Cloudflare account owning the private word data bucket."
  type        = string
}

variable "words_bucket_name" {
  description = "Private R2 bucket for words.json (default jurisdiction)."
  type        = string
}
