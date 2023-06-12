import { ABI, projectContractAddress } from "./config.js";

let web3js;
let account;
let contract;
let projectListElement = document.getElementById("project-list");
let createBtn = document.getElementById("createBtn");
let buttonLoad = document.getElementById("loading");

function displayAccount() {
  const accountElement = document.getElementById('UserAd');
  accountElement.textContent = 'Your Account: ' + account;
}

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
    displayAccount();
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
    buttonLoad.style.display = 'block';
    await contract.methods.createProject(title, description).send({ from: account });
    alert('Project created successfully!');
    await displayProjects();
  } catch (error) {
    console.error(error);
    alert('Failed to create project.');
  }
  finally{
    buttonLoad.style.display = 'none';
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

async function listDonors(projectId) {
  try {
      let donorCount = await contract.methods.getDonorCount(projectId).call();
      let donorList = [];

      for (let i = 0; i < donorCount; i++) {
          let donorData = await contract.methods.getDonorByIndex(projectId, i).call();
          let donorAddress = donorData[0];
          let donationAmount = web3js.utils.fromWei(donorData[1].toString(), 'ether');

          donorList.push(`Address: ${donorAddress}, Amount: ${donationAmount} ETH`);
      }

      // Join the donors into a single string and show it in an alert
      let donorString = donorList.join('\n');
      alert(donorString);

  } catch (error) {
      console.error(error);
      alert('Failed to fetch donors.');
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
      let totalDonation = web3js.utils.fromWei(project.totalDonations, 'ether');
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
              <button class="btn btn-success donateButton" type="button">Donate</button>
              <button class="btn btn-primary ListBtn" type="button">List of donors</button>
            </div>
            <small class="text-body-secondary">${totalDonation} ETH</small>
          </div>
        </div>
      </div>
  `;
  
  projectsContainer.appendChild(projectElement);
  
  let donateButtons = projectElement.getElementsByClassName("donateButton");
  let ListBtn = projectElement.getElementsByClassName("ListBtn");
      for(let j = 0; j < donateButtons.length; j++) {
          donateButtons[j].addEventListener("click", () => donate(i));
      }
      for(let j = 0; j < ListBtn.length; j++) {
        ListBtn[j].addEventListener("click", () => listDonors(i));
    }
      
    }

  } catch (error) {
    console.error(error);
    alert('Failed to fetch projects.');
  }
}




initialize();
