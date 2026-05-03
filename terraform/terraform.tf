terraform {
  required_version = ">= 1.6.0"

  cloud {
    organization = "cw-terraform-prod"

    workspaces {
      name = "AI-guesser"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}
