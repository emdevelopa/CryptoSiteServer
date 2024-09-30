var axios = require("axios");
var data = JSON.stringify({
  Referenceid: "0101",
  RequestType: "01",
  Translocation: "0101",
  SessionID: "01",
  FromAccount: "01",
  ToAccount: "0731517829",
  Amount: "01",
  DestinationBankCode: "185008",
  NEResponse: "01",
  BenefiName: "01",
  PaymentReference: "01",
  OriginatorAccountName: "01",
  translocation: "01",
});

var config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://fsi.ng/api/sterling/accountapi/api/Spay/InterbankTransferReq",
  headers: {
    // "Sandbox-Key": "3f81b44afa59a7737ffd448d458aef99",
    "Ocp-Apim-Subscription-Key": "t",
    "Ocp-Apim-Trace": "true",
    Appid: "69",
    "Content-Type": "application/json",
    ipval: "0",
    "sandbox-key": "4MsUCjlXYL4Tww5UgYcqakgdqIXFHgHg1716498302",
  },
  data: data
};


axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
