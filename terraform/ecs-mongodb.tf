# MongoDB ECS Service

# -------------------------------------------------------------------------------------------------
# Task Definition
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_task_definition" "mongodb" {
  family                   = "blinkit-${var.environment}-mongodb"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256" # Use fixed low CPU and memory to ensure fit
  memory                   = "512" 

  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "mongodb"
      image     = "mongo:7.0"
      essential = true
      cpu       = 0
      memoryReservation = var.task_memory_reservation["mongodb"]
      
      portMappings = [
        {
          containerPort = 27017
          hostPort      = 27017 # Fixed host port for internal DNS simplicity
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "MONGO_INITDB_DATABASE"
          value = "blinkit_clone_db"
        }
      ]
      
      # No secrets for no-auth setup to matches existing app code
      secrets = []
      
      # Bind mount for persistence on EC2 instance
      mountPoints = [
        {
          sourceVolume  = "mongodb_data"
          containerPath = "/data/db"
          readOnly      = false
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_service_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "mongodb"
        }
      }
    }
  ])

  # Volume definition for bind mount using host path
  volume {
    name      = "mongodb_data"
    host_path = "/var/lib/mongo_data_blinkit"
  }
}

# -------------------------------------------------------------------------------------------------
# Service
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_service" "mongodb" {
  name            = "mongodb"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.mongodb.arn
  desired_count   = 1
  
  # No load balancer for database - internal access only
  
  # Register with Service Discovery (Cloud Map) which integrates with Route53
  service_registries {
    registry_arn = aws_service_discovery_service.mongodb.arn
    container_name = "mongodb"
    container_port = 27017
  }
}

# -------------------------------------------------------------------------------------------------
# Service Discovery Service
# -------------------------------------------------------------------------------------------------

resource "aws_service_discovery_service" "mongodb" {
  name = "mongodb"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    
    dns_records {
      ttl  = 10
      type = "A" # A record pointing to EC2 instance private IP
    }
    
    routing_policy = "MULTIVALUE"
  }
  
  health_check_custom_config {
    failure_threshold = 1
  }
}
