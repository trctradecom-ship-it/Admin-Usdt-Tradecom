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
"function updateEMA()",

"function setFallbackICO(address)",
"function setPriceSourceToFallback()"
];

function updateStatus(msg){
document.getElementById("status").innerHTML = msg;
}

// CONNECT
document.getElementById("connectBtn").onclick = async () => {
await window.ethereum.request({ method: "eth_requestAccounts" });

provider = new ethers.providers.Web3Provider(window.ethereum);
signer = provider.getSigner();
user = await signer.getAddress();

contract = new ethers.Contract(contractAddress, abi, signer);

document.getElementById("wallet").innerText =
user.slice(0,6)+"..."+user.slice(-4);

await loadData();
initChart();
};

// LOAD DATA
async function loadData(){
const rTRC = await contract.rewardPoolTRC();
const rUSDT = await contract.rewardPoolUSDT();

const tTRC = await contract.taxPoolTRC();
const tUSDT = await contract.taxPoolUSDT();

const bal = await contract.contractTRCBalance();
const price = await contract.getTRCPriceUSD();

document.getElementById("rewardPool").innerText =
ethers.utils.formatUnits(rTRC,18);

document.getElementById("rewardUSDT").innerText =
ethers.utils.formatUnits(rUSDT,18);

document.getElementById("taxPool").innerText =
ethers.utils.formatUnits(tTRC,18);

document.getElementById("taxUSDT").innerText =
ethers.utils.formatUnits(tUSDT,18);

document.getElementById("contractBalance").innerText =
ethers.utils.formatUnits(bal,18);

document.getElementById("trcPrice").innerText =
ethers.utils.formatUnits(price,18);

updateChart(ethers.utils.formatUnits(bal,18));
}

// TX HANDLER
async function handleTx(tx){
try{
updateStatus("⏳ Processing...");
const t = await tx;
await t.wait();
updateStatus("✅ Success");
await loadData();
}catch(e){
console.log(e);
updateStatus("❌ Failed");
}
}

// REWARD
document.getElementById("depositBtn").onclick = () => {
const v = document.getElementById("depositAmount").value;
handleTx(contract.depositRewardTRC(ethers.utils.parseUnits(v,18)));
};

document.getElementById("depositUSDTBtn").onclick = () => {
const v = document.getElementById("depositAmount").value;
handleTx(contract.depositRewardUSDT(ethers.utils.parseUnits(v,18)));
};

document.getElementById("withdrawRewardBtn").onclick = () => {
const v = document.getElementById("withdrawRewardAmount").value;
handleTx(contract.withdrawRewardPoolTRC(ethers.utils.parseUnits(v,18)));
};

document.getElementById("withdrawRewardUSDTBtn").onclick = () => {
const v = document.getElementById("withdrawRewardAmount").value;
handleTx(contract.withdrawRewardPoolUSDT(ethers.utils.parseUnits(v,18)));
};

document.getElementById("withdrawTaxBtn").onclick = () => {
handleTx(contract.withdrawTaxTRC());
};

document.getElementById("withdrawTaxUSDTBtn").onclick = () => {
handleTx(contract.withdrawTaxUSDT());
};

// PRICE
document.getElementById("setIcoBtn").onclick = () => handleTx(contract.setPriceSourceToICO());
document.getElementById("setEmaBtn").onclick = () => handleTx(contract.setPriceSourceToEMA());

document.getElementById("setManualBtn").onclick = () => {
const v = document.getElementById("manualPrice").value;
handleTx(contract.setPriceSourceToManual(ethers.utils.parseUnits(v,18)));
};

document.getElementById("setDexBtn").onclick = () => {
const v = document.getElementById("dexAddress").value;
handleTx(contract.setPriceSourceToDex(v));
};

document.getElementById("initEmaBtn").onclick = () => handleTx(contract.initializeEMA());
document.getElementById("updateEmaBtn").onclick = () => handleTx(contract.updateEMA());

// FALLBACK
document.getElementById("setFallbackBtn").onclick = () => {
const v = document.getElementById("fallbackAddress").value;
handleTx(contract.setFallbackICO(v));
};

document.getElementById("useFallbackBtn").onclick = () => {
handleTx(contract.setPriceSourceToFallback());
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

function updateChart(v){
const t = new Date().toLocaleTimeString();
chart.data.labels.push(t);
chart.data.datasets[0].data.push(v);

if(chart.data.labels.length>20){
chart.data.labels.shift();
chart.data.datasets[0].data.shift();
}
chart.update();
}

// AUTO REFRESH
setInterval(()=>{ if(contract) loadData(); },10000);
