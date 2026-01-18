pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'gitHub-creds',
                    url: 'https://github.com/Madamebharathi/capstone-project'
            }
        }

        stage('Build & Deploy Docker Compose') {
            steps {
                sh '''
                # Go to repo directory
                cd $WORKSPACE
                
                # Stop & remove previous containers
                docker-compose down -v
                
                # Build all images
                docker-compose build
                
                # Start all containers in detached mode
                docker-compose up -d
                '''
            }
        }
    }
}
