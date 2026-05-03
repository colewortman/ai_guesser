output "site_bucket_name" {
  value       = aws_s3_bucket.site.bucket
  description = "S3 bucket hosting the built React app and image assets."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.cdn.id
  description = "CloudFront distribution ID (used by the deploy workflow for cache invalidation)."
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.cdn.domain_name
  description = "CloudFront default domain name."
}

output "leaderboard_table_name" {
  value       = aws_dynamodb_table.leaderboard.name
  description = "DynamoDB table backing the leaderboard."
}

output "leaderboard_api_endpoint" {
  value       = aws_apigatewayv2_api.leaderboard.api_endpoint
  description = "Invoke URL for the leaderboard HTTP API."
}
