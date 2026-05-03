variable "project" {
  type        = string
  description = "Project name used for tagging and resource naming."
  default     = "ai-guesser"
}

variable "aws_region" {
  type        = string
  description = "Primary AWS region for the leaderboard API and DynamoDB."
  default     = "us-east-2"
}

variable "domain_name" {
  type        = string
  description = "Apex domain served by CloudFront."
  default     = "aiguesser.it.com"
}

variable "site_subdomain" {
  type        = string
  description = "Subdomain that serves the React app (set to empty string for apex only)."
  default     = ""
}
