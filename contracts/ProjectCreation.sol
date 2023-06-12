// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

contract ProjectCreation {
    struct Donor {
        address donorAddress;
        uint amountDonated;
    }

    struct Project {
        uint id;
        string title;
        string description;
        address payable projectOwner;
        mapping(address => Donor) donors;
        address [] DonorAdresses;
        uint [] DonorAmount;
        uint totalDonations;
    }

    mapping(uint => Project) public projects;
    uint public projectCount;

    constructor() {
        projectCount = 0;
    }

    function createProject(string memory _title, string memory _description) external {
        Project storage project = projects[projectCount];
        project.id = projectCount;
        project.title = _title;
        project.description = _description;
        project.projectOwner = payable(msg.sender);
        projectCount++;
    }

    function donate(uint _projectId) external payable {
        require(_projectId < projectCount, "Invalid project id");
        require(projects[_projectId].donors[msg.sender].donorAddress == address(0), "Donor can only donate once");

        // Transfer the funds to project owner directly
        projects[_projectId].projectOwner.transfer(msg.value);

        // Save the donor's information
        projects[_projectId].donors[msg.sender] = Donor(msg.sender, msg.value);
        projects[_projectId].DonorAdresses.push(msg.sender);
        projects[_projectId].DonorAmount.push(msg.value);
        
        
        // Update total donations
        projects[_projectId].totalDonations += msg.value;
    }

    function getDonor(uint _projectId, address _donorAddress) external view returns (address, uint) {
        require(_projectId < projectCount, "Invalid project id");
        return (projects[_projectId].donors[_donorAddress].donorAddress, projects[_projectId].donors[_donorAddress].amountDonated);
    }

    function getTotalDonations(uint _projectId) external view returns (uint) {
        require(_projectId < projectCount, "Invalid project id");
        return projects[_projectId].totalDonations;
    }

    function getDonorByIndex(uint _projectId, uint _index) public view returns (address, uint) {
    require(_projectId < projectCount, "Invalid project id");
    require(_index < projects[_projectId].DonorAdresses.length, "Invalid index");

    address donorAddress = projects[_projectId].DonorAdresses[_index];
    return (donorAddress, projects[_projectId].donors[donorAddress].amountDonated);
}

function getDonorCount(uint _projectId) public view returns (uint) {
    require(_projectId < projectCount, "Invalid project id");
    return projects[_projectId].DonorAdresses.length;
}



}
