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

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t capstone-app .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop capstone || true
                docker rm capstone || true
                docker run -d -p 80:8080 --name capstone capstone-app
                '''
            }
        }
    }
}
