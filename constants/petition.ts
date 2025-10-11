export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
      { internalType: "uint256", name: "endDate", type: "uint256" }
    ],
    name: "createPetition",
    outputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "signPetition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getPetition",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "title", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "imageUrl", type: "string" },
        { internalType: "uint256", name: "startDate", type: "uint256" },
        { internalType: "uint256", name: "endDate", type: "uint256" },
        { internalType: "uint256", name: "signatureCount", type: "uint256" },
        { internalType: "bool", name: "isActive", type: "bool" },
        { internalType: "uint256", name: "createdAt", type: "uint256" }
      ],
      internalType: "struct Petition.PetitionData",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalPetitions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "address", name: "signer", type: "address" }
    ],
    name: "hasAddressSigned",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getSigners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getUpdateLogs",
    outputs: [{
      components: [
        { internalType: "uint256", name: "timestamp", type: "uint256" },
        { internalType: "string", name: "fieldUpdated", type: "string" },
        { internalType: "string", name: "oldValue", type: "string" },
        { internalType: "string", name: "newValue", type: "string" }
      ],
      internalType: "struct Petition.UpdateLog[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newTitle", type: "string" }
    ],
    name: "updateTitle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newDescription", type: "string" }
    ],
    name: "updateDescription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newImageUrl", type: "string" }
    ],
    name: "updateImage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
