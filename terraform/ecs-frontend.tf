# Frontend ECS Service

# -------------------------------------------------------------------------------------------------
# Task Definition
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_task_definition" "frontend" {
  family                   = "blinkit-${var.environment}-frontend"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "256"

  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true
      cpu       = 0
      memoryReservation = var.task_memory_reservation["frontend"]
      
      portMappings = [
        {
          containerPort = 80
          hostPort      = 0 # Dynamic port mapping
          protocol      = "tcp"
        }
      ]
      
      # Nginx config is baked into image, but we can override env vars if the startup script supports it
      # For this specific app, API URL is baked at build time. 
      # We assume the image was built with VITE_API_URL="" (relative path) so it uses the same origin (ALB)
      environment = []
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_service_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# -------------------------------------------------------------------------------------------------
# Service
# -------------------------------------------------------------------------------------------------

resource "aws_ecs_service" "frontend" {
  name            = "frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }
}
