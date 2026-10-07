# Portfolio Repository

This repository is used as a **learning playground** to experiment with **GitHub Actions workflows**, especially for automating the **build and deployment process** to a home server.  
In addition, this repository will serve as a container for various portfolio sections such as:

- **Relevants Projects**
- **Blog**
- **Technology Experiments**

## Workflow & Deployment

The automation process includes:

- **Automatic build** using Vite after pushing to a specific branch.
- **Automated deployment** to the home server through GitHub Actions.
- **Nginx configuration** as a reverse proxy to serve the domain.
- **SSL & Domain setup** to ensure secure access via HTTPS.

## Progress & Learnings

During this process, several important lessons have been learned:

- Configuring **GitHub Actions** to access the server via SSH.
- Troubleshooting issues such as **SSL handshake errors**, **403/405 responses**, and **blank page** after `vite build`.
- Optimizing **Nginx configuration** to ensure the website is properly served under the public domain.
- Designing a flexible pipeline that can be extended for new sections (projects, blog, etc.).

## Next Steps

- Add **dynamic projects & blog sections**.
- Experiment with **CDN & caching** for better performance.
- Implement **basic monitoring** for deployment status.
- Write more detailed documentation for server setup & workflow.  
