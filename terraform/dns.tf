# DNS for aiguesser.it.com is managed at an external registrar / DNS provider,
# not in Route 53. Terraform only owns the ACM certificate itself; the cert's
# DNS validation records and the A/CNAME record pointing the site at
# CloudFront are maintained by hand at the external provider.

resource "aws_acm_certificate" "cdn" {
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
