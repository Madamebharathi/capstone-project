pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Madamebharathi/capstone-project.git'
            }
        }

        stage('Stop Old Containers') {
            steps {
                // Stop old containers, remove volumes and orphans
                sh '''
                docker-compose down -v --remove-orphans || true
                docker system prune -f
                '''
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }

        stage('Verify') {
            steps {
                echo "Listing all loan project containers:"
                sh 'docker ps --filter "name=loan-"'
            }
        }
    }
}
