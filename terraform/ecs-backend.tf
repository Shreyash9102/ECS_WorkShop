# Backend ECS Service

# -------------------------------------------------------------------------------------------------
# Task Definition
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_task_definition" "backend" {
  family                   = "blinkit-${var.environment}-backend"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "768"

  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true
      cpu       = 0
      memoryReservation = var.task_memory_reservation["backend"]
      
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 0 # Dynamic port mapping
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "PORT"
          value = "8080"
        },
        {
          name  = "MONGODB_URI"
          # Using Route 53 private DNS domain
          value = "mongodb://mongodb.blinkit.internal:27017/blinkit_clone_db"
        },
        {
          name  = "FRONTEND_URL"
          # ALB DNS Name (assuming http for workshop)
          value = "http://${aws_lb.main.dns_name}" 
        }
      ]
      
      secrets = [
        {
          name      = "SECRET_KEY_ACCESS_TOKEN"
          valueFrom = aws_ssm_parameter.access_token_secret.arn
        },
        {
          name      = "SECRET_KEY_REFRESH_TOKEN"
          valueFrom = aws_ssm_parameter.refresh_token_secret.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_service_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# -------------------------------------------------------------------------------------------------
# Service
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_service" "backend" {
  name            = "backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  
  # Allow ECS to wait for CLOUDFORMATION_STACK_1 to stabilize
  # health_check_grace_period_seconds = 60 # Optional: Enable if backend takes time to start

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }
}
