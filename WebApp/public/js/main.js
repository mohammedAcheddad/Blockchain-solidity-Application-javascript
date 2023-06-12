import { ABI, projectContractAddress } from "./config.js";

let web3js;
let account;
let contract;
let projectListElement = document.getElementById("project-list");
let createBtn = document.getElementById("createBtn");

async function initialize() {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    return alert('Please install MetaMask.');
  }

  web3js = new Web3(window.ethereum);

  // Request account access from MetaMask
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3js.eth.getAccounts();
    account = accounts[0];
  } catch (error) {
    console.error(error);
    return alert('Failed to connect to MetaMask.');
  }

  // Create contract instance
  contract = new web3js.eth.Contract(ABI, projectContractAddress);

  // Event handler for form
  createBtn.addEventListener("click",createProject);

  // Display initial projects
  await displayProjects();
}

async function createProject(event) {
  event.preventDefault();

  let title = document.getElementById("titleId").value;
  let description = document.getElementById("descriptionId").value;

  try {
    await contract.methods.createProject(title, description).send({ from: account });
    alert('Project created successfully!');
    await displayProjects();
  } catch (error) {
    console.error(error);
    alert('Failed to create project.');
  }
}

async function donate(projectId) {
  try {
    let amountToDonate = prompt('Please enter the amount in ETH to send to this project');
    let value = web3js.utils.toWei(amountToDonate, 'ether'); // Convert from Ether to Wei
    
    await contract.methods.donate(projectId).send({ from: account, value });
    alert(`Successfully donated ${amountToDonate} ETH!`);
    displayProjects(); // Refresh the project list
  } catch (error) {
    console.error(error);
    alert('Failed to donate.');
  }
}

async function displayProjects() {
  try {
    let projectCount = await contract.methods.projectCount().call();

    let projectsContainer = document.getElementById('projectsContainer');
    projectsContainer.innerHTML = ""; // Clear the projects container

    for (let i = 0; i < projectCount; i++) {
      let project = await contract.methods.projects(i).call();
      let title = project.title;
      let description = project.description;
      let owner = project.projectOwner;
      let totalDonation = project.totalDonations;
      console.log(project)

      // Create new project element
      let projectElement = document.createElement("div");
      projectElement.classList.add("col");
      projectElement.innerHTML = `
        <div class="card shadow-sm">
          <h2 class="projectTitle">${i + 1}- ${title}</h2>
          <h2 class="projectTitle">${owner}</h2>
          <div class="card-body">
            <p class="card-text textProject">${description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button class="btn btn-success" type="button" id="DonateBtn">Donate</button>
                <button class="btn btn-primary" type="button" id="listDonorsBtn">List of donors</button>
              </div>
              <small class="text-body-secondary">${totalDonation} ETH</small>
            </div>
          </div>
        </div>
      `;
      let DonateBtn = document.getElementById("DonateBtn");
      DonateBtn.addEventListener("click",donate);

      projectsContainer.appendChild(projectElement);
    }

  } catch (error) {
    console.error(error);
    alert('Failed to fetch projects.');
  }
}




initialize();
