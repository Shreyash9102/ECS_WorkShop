# Route 53 Private Hosted Zone for Internal Service Discovery

resource "aws_route53_zone" "internal" {
  name = "blinkit.internal"
  vpc {
    vpc_id = local.vpc_id
  }
  
  # Private zone for internal communication
  comment = "Internal DNS for Blinkit services"
}

# The A records for services will be managed via the ECS Service Discovery setup
# But we can define the namespace here if we were using AWS Cloud Map directly
# For this setup simpler setup, we'll use CloudMap namespace resources which integrate with Route53

resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = "blinkit.internal"
  description = "Service discovery namespace for Blinkit internal services"
  vpc         = local.vpc_id
}
