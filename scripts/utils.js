const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "deployedAddress.json");

// Function to save contract address
function saveContractAddress(name, address) {
    let data = {};
    
    // If file exists, read and update it
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    data[name] = address; // Update contract address

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Contract address for ${name} updated: ${address}`);
}

// Function to get the latest deployed contract address
function getContractAddress(name) {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data[name] || null;
}

module.exports = { saveContractAddress, getContractAddress };
