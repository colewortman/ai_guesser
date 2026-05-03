# Distribution fronts the S3 *website* endpoint (HTTP-only custom origin),
# not a regional S3 origin with OAC. Migrating to OAC would be a separate,
# deliberate change.

locals {
  s3_website_origin_id = "s3-ai-guesser.s3.us-east-2.amazonaws.com-mk5yew9sck8"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_All"

  aliases = [var.domain_name]

  web_acl_id = "arn:aws:wafv2:us-east-1:202991357355:global/webacl/CreatedByCloudFront-9e5c8487/9ac6d1e1-0f48-4a70-b92c-fb4c336fd0d6"

  origin {
    domain_name = aws_s3_bucket.site.website_endpoint
    origin_id   = local.s3_website_origin_id

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_keepalive_timeout = 5
      origin_read_timeout      = 30
    }
  }

  default_cache_behavior {
    target_origin_id       = local.s3_website_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # CachingOptimized managed policy.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cdn.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "CF-ai-guesser"
  }
}
