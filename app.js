let provider, signer, contract, user, chart;

const contractAddress = "0x90789d75566f6475b6Ea4cbcCF29C7e8F6cE399D";

const abi = [
"function owner() view returns(address)",

"function rewardPoolTRC() view returns(uint256)",
"function rewardPoolUSDT() view returns(uint256)",

"function taxPoolTRC() view returns(uint256)",
"function taxPoolUSDT() view returns(uint256)",

"function contractTRCBalance() view returns(uint256)",
"function getTRCPriceUSD() view returns(uint256)",

"function depositRewardTRC(uint256)",
"function depositRewardUSDT(uint256)",

"function withdrawRewardPoolTRC(uint256)",
"function withdrawRewardPoolUSDT(uint256)",

"function withdrawTaxTRC()",
"function withdrawTaxUSDT()",

"function setPriceSourceToManual(uint256)",
"function setPriceSourceToDex(address)",
"function setPriceSourceToEMA()",
"function setPriceSourceToICO()",

"function initializeEMA()",
"function updateEMA()"
];

// STATUS
function updateStatus(msg){
document.getElementById("status").innerHTML = msg;
}

// CONNECT
document.getElementById("connectBtn").onclick = async () => {
try{
if(!window.ethereum) return alert("Install MetaMask");

await window.ethereum.request({ method: "eth_requestAccounts" });

provider = new ethers.providers.Web3Provider(window.ethereum);
signer = provider.getSigner();
user = await signer.getAddress();

contract = new ethers.Contract(contractAddress, abi, signer);

const owner = await contract.owner();

document.getElementById("wallet").innerText =
user.slice(0,6) + "..." + user.slice(-4);

updateStatus(user.toLowerCase() === owner.toLowerCase()
? "✅ Owner"
: "⚠️ User");

await loadData();
initChart();

}catch(e){
console.log(e);
updateStatus("❌ Error");
}
};

// LOAD DATA
async function loadData(){
try{

const rTRC = await contract.rewardPoolTRC();
const rUSDT = await contract.rewardPoolUSDT();

const tTRC = await contract.taxPoolTRC();
const tUSDT = await contract.taxPoolUSDT();

const bal = await contract.contractTRCBalance();
const price = await contract.getTRCPriceUSD();

document.getElementById("rewardPool").innerText =
ethers.utils.formatUnits(rTRC,18);

document.getElementById("taxPool").innerText =
ethers.utils.formatUnits(tTRC,18);

document.getElementById("contractBalance").innerText =
ethers.utils.formatUnits(bal,18);

document.getElementById("trcPrice").innerText =
ethers.utils.formatUnits(price,18);

updateChart(ethers.utils.formatUnits(bal,18));

}catch(e){
console.log(e);
}
}

// TX HANDLER
async function handleTx(txPromise){
try{
updateStatus("⏳ Processing...");
const tx = await txPromise;

updateStatus(`TX Sent: ${tx.hash}`);

await tx.wait();

updateStatus("✅ Done");
await loadData();

}catch(e){
console.log(e);
updateStatus("❌ Failed");
}
}

// REWARD
document.getElementById("depositBtn").onclick = async () => {
const val = document.getElementById("depositAmount").value;
handleTx(contract.depositRewardTRC(ethers.utils.parseUnits(val,18)));
};

document.getElementById("withdrawRewardBtn").onclick = async () => {
const val = document.getElementById("withdrawRewardAmount").value;
handleTx(contract.withdrawRewardPoolTRC(ethers.utils.parseUnits(val,18)));
};

document.getElementById("withdrawTaxBtn").onclick = async () => {
handleTx(contract.withdrawTaxTRC());
};

// PRICE
document.getElementById("setManualBtn").onclick = async () => {
const val = document.getElementById("manualPrice").value;
handleTx(contract.setPriceSourceToManual(ethers.utils.parseUnits(val,18)));
};

document.getElementById("setDexBtn").onclick = async () => {
const val = document.getElementById("dexAddress").value;
handleTx(contract.setPriceSourceToDex(val));
};

document.getElementById("setEmaBtn").onclick = async () => {
handleTx(contract.setPriceSourceToEMA());
};

document.getElementById("setIcoBtn").onclick = async () => {
handleTx(contract.setPriceSourceToICO());
};

document.getElementById("initEmaBtn").onclick = async () => {
handleTx(contract.initializeEMA());
};

document.getElementById("updateEmaBtn").onclick = async () => {
handleTx(contract.updateEMA());
};

// CHART
function initChart(){
const ctx = document.getElementById("chart").getContext("2d");

chart = new Chart(ctx,{
type:"line",
data:{labels:[],datasets:[{data:[],borderColor:"#00ffcc"}]},
options:{responsive:true,maintainAspectRatio:false}
});
}

function updateChart(val){
const t = new Date().toLocaleTimeString();

chart.data.labels.push(t);
chart.data.datasets[0].data.push(val);

if(chart.data.labels.length > 20){
chart.data.labels.shift();
chart.data.datasets[0].data.shift();
}

chart.update();
}

// AUTO REFRESH
setInterval(()=>{ if(contract) loadData(); },10000);
