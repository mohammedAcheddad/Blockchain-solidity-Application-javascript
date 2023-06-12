const ProjectCreation = artifacts.require('ProjectCreation');

module.exports = (deployer, network, accounts) => {
    deployer.deploy(ProjectCreation);
};
