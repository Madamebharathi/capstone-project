pipeline {
    agent any
    
    environment {
        COMPOSE_PROJECT_NAME = 'loanpricing'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from Git...'
                checkout scm
            }
        }
        
        stage('Verify Files') {
            steps {
                echo '🔍 Verifying required files...'
                sh '''
                    ls -la
                    if [ ! -f "docker-compose.yml" ]; then
                        echo "❌ docker-compose.yml not found!"
                        exit 1
                    fi
                    if [ ! -d "backend" ]; then
                        echo "❌ backend directory not found!"
                        exit 1
                    fi
                    if [ ! -d "frontend" ]; then
                        echo "❌ frontend directory not found!"
                        exit 1
                    fi
                    echo "✅ All required files present"
                '''
            }
        }
        
        stage('Clean Previous Deployment') {
            steps {
                echo '🧹 Cleaning previous deployment...'
                sh '''
                    docker-compose down -v || true
                    docker system prune -f || true
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building Docker images...'
                sh 'docker-compose build --no-cache'
            }
        }
        
        stage('Start Services') {
            steps {
                echo '🚀 Starting all services...'
                sh 'docker-compose up -d'
                echo '⏳ Waiting for services to initialize (60 seconds)...'
                sh 'sleep 60'
            }
        }
        
        stage('Health Checks') {
            steps {
                echo '🏥 Running health checks...'
                script {
                    // Check containers are running
                    sh '''
                        echo "=== Container Status ==="
                        docker-compose ps
                        
                        # Check if all containers are up
                        RUNNING=$(docker-compose ps | grep "Up" | wc -l)
                        if [ "$RUNNING" -lt 5 ]; then
                            echo "❌ Not all containers are running"
                            docker-compose ps
                            exit 1
                        fi
                        echo "✅ All containers are running"
                    '''
                    
                    // Check MongoDB
                    sh '''
                        echo "=== Checking MongoDB ==="
                        for i in {1..10}; do
                            if docker exec loan-mongodb mongosh --eval "db.adminCommand('ping')" 2>/dev/null; then
                                echo "✅ MongoDB is healthy"
                                break
                            fi
                            echo "Waiting for MongoDB... ($i/10)"
                            sleep 3
                        done
                    '''
                    
                    // Check Kafka
                    sh '''
                        echo "=== Checking Kafka ==="
                        for i in {1..10}; do
                            if docker exec loan-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null; then
                                echo "✅ Kafka is healthy"
                                break
                            fi
                            echo "Waiting for Kafka... ($i/10)"
                            sleep 3
                        done
                    '''
                    
                    // Check Backend
                    sh '''
                        echo "=== Checking Backend ==="
                        for i in {1..30}; do
                            if curl -f http://localhost:8081/actuator/health 2>/dev/null; then
                                echo "✅ Backend is healthy"
                                exit 0
                            fi
                            echo "Waiting for backend... ($i/30)"
                            sleep 2
                        done
                        echo "❌ Backend health check failed"
                        docker-compose logs loan-backend
                        exit 1
                    '''
                    
                    // Check Frontend
                    sh '''
                        echo "=== Checking Frontend ==="
                        if curl -f http://localhost:8080 2>/dev/null; then
                            echo "✅ Frontend is accessible"
                        else
                            echo "❌ Frontend check failed"
                            docker-compose logs loan-frontend
                            exit 1
                        fi
                    '''
                }
            }
        }
        
        stage('Verify Database') {
            steps {
                echo '🔍 Verifying admin user in database...'
                sh '''
                    sleep 5
                    if docker exec loan-mongodb mongosh loan_pricing_db --eval "db.users.findOne({email: 'admin@loanapp.com'})" | grep -q "admin@loanapp.com"; then
                        echo "✅ Admin user found in database"
                    else
                        echo "⚠️  Admin user not found - checking backend logs"
                        docker-compose logs loan-backend | grep -i "admin"
                    fi
                '''
            }
        }
        
        stage('Verify Kafka') {
            steps {
                echo '📨 Verifying Kafka topics...'
                sh '''
                    echo "=== Available Kafka Topics ==="
                    docker exec loan-kafka kafka-topics --bootstrap-server localhost:9092 --list
                    
                    if docker exec loan-kafka kafka-topics --bootstrap-server localhost:9092 --list | grep -q "loan-events"; then
                        echo "✅ loan-events topic found"
                    else
                        echo "⚠️  loan-events topic not found yet (will be created on first message)"
                    fi
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ =============================================='
            echo '✅         DEPLOYMENT SUCCESSFUL!'
            echo '✅ =============================================='
            echo ''
            sh '''
                PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
                echo "   🌐 Frontend: http://${PUBLIC_IP}:8080"
                echo "   🔧 Backend API: http://${PUBLIC_IP}:8081"
                echo "   💾 MongoDB: ${PUBLIC_IP}:27017"
                echo "   📨 Kafka: ${PUBLIC_IP}:9092"
                echo "   👤 Admin Login: admin@loanapp.com / admin123"
                echo ''
            '''
            echo '✅ =============================================='
            
            sh 'docker-compose ps'
        }
        
        failure {
            echo '❌ =============================================='
            echo '❌         DEPLOYMENT FAILED!'
            echo '❌ =============================================='
            echo ''
            echo '📋 Collecting logs for debugging...'
            
            sh '''
                echo "=== Container Status ==="
                docker-compose ps || true
                
                echo ""
                echo "=== Backend Logs (Last 100 lines) ==="
                docker-compose logs --tail=100 loan-backend || true
                
                echo ""
                echo "=== Kafka Logs (Last 50 lines) ==="
                docker-compose logs --tail=50 kafka || true
                
                echo ""
                echo "=== MongoDB Logs (Last 50 lines) ==="
                docker-compose logs --tail=50 mongodb || true
                
                echo ""
                echo "=== Frontend Logs (Last 50 lines) ==="
                docker-compose logs --tail=50 loan-frontend || true
            '''
            
            echo ''
            echo '❌ =============================================='
            
            // Cleanup on failure
            sh 'docker-compose down -v || true'
        }
        
        always {
            echo '📊 Generating deployment report...'
            sh '''
                echo "Deployment Report - $(date)" > deployment-report.txt
                echo "======================================" >> deployment-report.txt
                echo "" >> deployment-report.txt
                docker-compose ps >> deployment-report.txt 2>&1 || true
            '''
            archiveArtifacts artifacts: 'deployment-report.txt', allowEmptyArchive: true
        }
    }
}
