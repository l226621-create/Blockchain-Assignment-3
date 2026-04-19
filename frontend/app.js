const CONTRACT_ADDRESS = "0x7441FC61fA5766EF1113935947e5780A931fF71B";
const AMOY_CHAIN_ID = "0x13882";
const ethersLib = window.ethers;

const ROLE_LABELS = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];
const STATUS_LABELS = ["Manufactured", "In Transit", "Delivered"];

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }, { internalType: "uint8", name: "role", type: "uint8" }],
    name: "assignRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "productId", type: "uint256" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "address", name: "currentOwner", type: "address" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "bool", name: "exists", type: "bool" }
        ],
        internalType: "struct MustafaSajidBlockchain.Product",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "productId", type: "uint256" }],
    name: "getProductHistory",
    outputs: [
      {
        components: [
          { internalType: "address", name: "holder", type: "address" },
          { internalType: "uint8", name: "role", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        internalType: "struct MustafaSajidBlockchain.HistoryEntry[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "name", type: "string" }, { internalType: "string", name: "description", type: "string" }],
    name: "registerProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "roles",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "productId", type: "uint256" }, { internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

let provider;
let signer;
let contract;
const ethereumProvider = getEthereumProvider();

const connectButton = document.querySelector("#connect-btn");
const switchNetworkButton = document.querySelector("#switch-network-btn");
const walletAddressEl = document.querySelector("#wallet-address");
const networkNameEl = document.querySelector("#network-name");
const walletRoleEl = document.querySelector("#wallet-role");
const globalMessageEl = document.querySelector("#global-message");
const productDetailsEl = document.querySelector("#product-details");
const historyListEl = document.querySelector("#history-list");

document.querySelector("#contract-address").textContent = CONTRACT_ADDRESS;

function handleConnectClick() {
  setMessage("Connect button clicked...");
  void connectWallet();
}

function handleSwitchClick() {
  setMessage("Switch button clicked...");
  void switchToAmoy();
}

connectButton.addEventListener("click", handleConnectClick);
switchNetworkButton.addEventListener("click", handleSwitchClick);
connectButton.onclick = handleConnectClick;
switchNetworkButton.onclick = handleSwitchClick;
window.connectWallet = handleConnectClick;
window.switchToAmoy = handleSwitchClick;
document.querySelector("#assign-role-form").addEventListener("submit", onAssignRole);
document.querySelector("#register-product-form").addEventListener("submit", onRegisterProduct);
document.querySelector("#transfer-product-form").addEventListener("submit", onTransferProduct);
document.querySelector("#lookup-product-form").addEventListener("submit", onLookupProduct);

if (!ethersLib) {
  setMessage("Ethers library failed to load. Refresh the page and try again.", "error");
}

if (ethereumProvider) {
  ethereumProvider.on("accountsChanged", () => connectWallet());
  ethereumProvider.on("chainChanged", () => connectWallet());
  if (ethersLib) {
    setMessage("Frontend ready. Connect MetaMask to begin.", "success");
  }
} else {
  setMessage("MetaMask not detected in this browser tab.", "error");
}

async function connectWallet() {
  if (!ethereumProvider) {
    setMessage("MetaMask not detected. Please install MetaMask first.", "error");
    return;
  }

  try {
    setMessage("Opening MetaMask connection request...");

    if (!ethersLib) {
      throw new Error("Ethers library is not available.");
    }

    provider = new ethersLib.BrowserProvider(ethereumProvider);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethersLib.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const walletAddress = await signer.getAddress();
    const network = await provider.getNetwork();
    const roleValue = await contract.roles(walletAddress);

    walletAddressEl.textContent = walletAddress;
    networkNameEl.textContent = `${network.name} (${network.chainId})`;
    walletRoleEl.textContent = ROLE_LABELS[Number(roleValue)] ?? "Unknown";

    if (`0x${network.chainId.toString(16)}`.toLowerCase() !== AMOY_CHAIN_ID) {
      setMessage("Wallet connected, but you are not on Polygon Amoy yet.", "error");
    } else {
      setMessage("Wallet connected successfully.", "success");
    }
  } catch (error) {
    setMessage(formatError(error), "error");
  }
}

async function switchToAmoy() {
  if (!ethereumProvider) {
    setMessage("MetaMask not detected. Please install MetaMask first.", "error");
    return;
  }

  try {
    setMessage("Requesting switch to Polygon Amoy...");

    await ethereumProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_CHAIN_ID }]
    });
    await connectWallet();
  } catch (switchError) {
    if (switchError.code === 4902) {
      await ethereumProvider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: AMOY_CHAIN_ID,
            chainName: "Polygon Amoy",
            nativeCurrency: {
              name: "POL",
              symbol: "POL",
              decimals: 18
            },
            rpcUrls: ["https://rpc-amoy.polygon.technology"],
            blockExplorerUrls: ["https://amoy.polygonscan.com"]
          }
        ]
      });
      await connectWallet();
      return;
    }

    setMessage(formatError(switchError), "error");
  }
}

async function onAssignRole(event) {
  event.preventDefault();
  if (!contract) {
    setMessage("Connect your wallet before sending transactions.", "error");
    return;
  }

  const account = document.querySelector("#role-address").value.trim();
  const role = Number(document.querySelector("#role-select").value);

  try {
    if (!ethersLib.isAddress(account)) {
      throw new Error("Enter a valid wallet address.");
    }

    if (![1, 2, 3, 4].includes(role)) {
      throw new Error("Choose a valid role before submitting.");
    }

    const readContract = new ethersLib.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      new ethersLib.JsonRpcProvider("https://rpc-amoy.polygon.technology")
    );

    const [connectedAddress, contractOwner] = await Promise.all([
      signer.getAddress(),
      readContract.owner()
    ]);

    if (connectedAddress.toLowerCase() !== contractOwner.toLowerCase()) {
      throw new Error("Switch to the contract owner wallet before assigning roles.");
    }

    setMessage("Submitting role assignment transaction...");
    const txHash = await sendContractTransaction("assignRole", [account, role], 150000);
    await provider.waitForTransaction(txHash);
    setMessage(`Role assigned successfully. Tx: ${txHash}`, "success");
  } catch (error) {
    setMessage(formatError(error), "error");
  }
}

async function onRegisterProduct(event) {
  event.preventDefault();
  if (!contract) {
    setMessage("Connect your wallet before sending transactions.", "error");
    return;
  }

  const name = document.querySelector("#product-name").value.trim();
  const description = document.querySelector("#product-description").value.trim();

  try {
    setMessage("Submitting product registration transaction...");
    const tx = await contract.registerProduct(name, description);
    await tx.wait();
    setMessage(`Product registered successfully. Tx: ${tx.hash}`, "success");
    event.target.reset();
  } catch (error) {
    setMessage(formatError(error), "error");
  }
}

async function onTransferProduct(event) {
  event.preventDefault();
  if (!contract) {
    setMessage("Connect your wallet before sending transactions.", "error");
    return;
  }

  const productId = document.querySelector("#transfer-product-id").value;
  const newOwner = document.querySelector("#new-owner-address").value.trim();

  try {
    if (!ethersLib.isAddress(newOwner)) {
      throw new Error("Enter a valid new owner wallet address.");
    }

    if (!productId || Number(productId) < 1) {
      throw new Error("Enter a valid product ID.");
    }

    const readContract = new ethersLib.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      new ethersLib.JsonRpcProvider("https://rpc-amoy.polygon.technology")
    );

    const connectedAddress = await signer.getAddress();
    const [product, senderRole, newOwnerRole] = await Promise.all([
      readContract.getProduct(productId),
      readContract.roles(connectedAddress),
      readContract.roles(newOwner)
    ]);

    if (product.currentOwner.toLowerCase() !== connectedAddress.toLowerCase()) {
      throw new Error("Switch to the wallet that currently owns this product before transferring it.");
    }

    if (!isValidRoleTransition(Number(senderRole), Number(newOwnerRole))) {
      throw new Error(
        `Invalid transfer route: ${ROLE_LABELS[Number(senderRole)] ?? "Unknown"} to ${ROLE_LABELS[Number(newOwnerRole)] ?? "Unknown"}.`
      );
    }

    setMessage("Submitting ownership transfer transaction...");
    const txHash = await sendContractTransaction("transferOwnership", [productId, newOwner], 180000);
    await provider.waitForTransaction(txHash);
    setMessage(`Ownership transferred successfully. Tx: ${txHash}`, "success");
    event.target.reset();
  } catch (error) {
    setMessage(formatError(error), "error");
  }
}

async function onLookupProduct(event) {
  event.preventDefault();

  const readProviderInstance = provider ?? (ethereumProvider ? new ethersLib.BrowserProvider(ethereumProvider) : new ethersLib.JsonRpcProvider("https://rpc-amoy.polygon.technology"));
  const readContract = new ethersLib.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProviderInstance);
  const productId = document.querySelector("#lookup-product-id").value;

  try {
    setMessage("Loading product details...");

    const product = await readContract.getProduct(productId);
    const history = await readContract.getProductHistory(productId);

    productDetailsEl.classList.remove("hidden");
    productDetailsEl.innerHTML = `
      <h3>Product #${Number(product.id)}</h3>
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Description:</strong> ${product.description}</p>
      <p><strong>Current Owner:</strong> ${product.currentOwner}</p>
      <p><strong>Status:</strong> ${STATUS_LABELS[Number(product.status)] ?? "Unknown"}</p>
    `;

    historyListEl.innerHTML = history
      .map(
        (entry, index) => `
          <div class="history-item">
            <p><strong>Step ${index + 1}</strong></p>
            <p><strong>Holder:</strong> ${entry.holder}</p>
            <p><strong>Role:</strong> ${ROLE_LABELS[Number(entry.role)] ?? "Unknown"}</p>
            <p><strong>Status:</strong> ${STATUS_LABELS[Number(entry.status)] ?? "Unknown"}</p>
            <p><strong>Timestamp:</strong> ${formatTimestamp(entry.timestamp)}</p>
          </div>
        `
      )
      .join("");

    setMessage("Product details loaded.", "success");
  } catch (error) {
    productDetailsEl.classList.add("hidden");
    historyListEl.innerHTML = "";
    setMessage(formatError(error), "error");
  }
}

function setMessage(message, type = "") {
  globalMessageEl.textContent = message;
  globalMessageEl.className = `message ${type}`.trim();
}

function formatTimestamp(value) {
  const timestamp = Number(value) * 1000;
  return new Date(timestamp).toLocaleString();
}

function formatError(error) {
  return (
    error?.shortMessage ||
    error?.info?.error?.data?.message ||
    error?.info?.error?.data?.originalError?.message ||
    error?.info?.error?.message ||
    error?.reason ||
    error?.message ||
    "Something went wrong."
  );
}

function getEthereumProvider() {
  const injected = window.ethereum;

  if (!injected) {
    return null;
  }

  if (Array.isArray(injected.providers)) {
    const metaMaskProvider = injected.providers.find((providerItem) => providerItem.isMetaMask);
    return metaMaskProvider ?? injected.providers[0] ?? injected;
  }

  return injected;
}

function isValidRoleTransition(fromRole, toRole) {
  return (
    (fromRole === 1 && toRole === 2) ||
    (fromRole === 2 && toRole === 3) ||
    (fromRole === 3 && toRole === 4)
  );
}

async function sendContractTransaction(functionName, args, gasLimit) {
  if (!ethereumProvider || !signer) {
    throw new Error("Connect your wallet before sending transactions.");
  }

  const from = await signer.getAddress();
  const iface = new ethersLib.Interface(CONTRACT_ABI);
  const data = iface.encodeFunctionData(functionName, args);
  const feeOverrides = await getFeeOverrides();

  return ethereumProvider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: CONTRACT_ADDRESS,
        data,
        gas: ethersLib.toQuantity(BigInt(gasLimit)),
        ...feeOverrides
      }
    ]
  });
}

async function getFeeOverrides() {
  const feeData = await provider.getFeeData();
  const minimumPriorityFee = ethersLib.parseUnits("30", "gwei");
  const priorityFee = feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minimumPriorityFee
    ? feeData.maxPriorityFeePerGas
    : minimumPriorityFee;

  const baseMaxFee = feeData.maxFeePerGas ?? (priorityFee * 2n);
  const maxFee = baseMaxFee > priorityFee * 2n ? baseMaxFee : priorityFee * 2n;

  return {
    maxPriorityFeePerGas: ethersLib.toQuantity(priorityFee),
    maxFeePerGas: ethersLib.toQuantity(maxFee)
  };
}
