web3 = new Web3
amount = 0.001
recaptcha = ''

axios.get('./api/q')
  .then(response => {
    document.getElementById('requestLimit').innerText = `Request limit: ${response.data.data} MOVR per 24 hours`
    amount = response.data.data
  })
  .catch(error => {
    console.log(error)
  })


const inputAddress= document.querySelector("#address");
inputAddress.addEventListener("input", alertAddress);
inputAddress.value = ""
function alertAddress() {
  getmovrBalance(inputAddress.value)

}
document.getElementById("requestBtn").disabled = true

function getmovrBalance(address) {
  if (!web3.utils.isAddress(address)) {
    document.getElementById('addressCheck').innerHTML = '<i class="fas fa-times"" style="color:#e66653" ></i>'
    return;
  }
  document.getElementById('addressCheck').innerHTML = '<i class="fas fa-check"" style="color:#46a656"></i>'
  document.getElementById('movrBalance').innerHTML = '<span class="spinner-grow spinner-grow-sm"></span>'
  axios.get(`./api/balance/${address}`)
    .then(response => {
      if (response.data.success) {
          document.getElementById('movrBalance').innerHTML = web3.utils.fromWei(response.data.data)
      }
    })
    .catch(error => {
      console.log(error)
    })
}

function enableRequest(token) {
  document.getElementById("requestBtn").disabled = false
  recaptcha = token
}

document.querySelector("#requestTokenForm").addEventListener("submit", function(e){
  e.preventDefault();
  const address = e.target.elements[0].value
  document.getElementById("requestBtn").disabled = true
  if (!web3.utils.isAddress(address)) {
    toastr.error("Please enter a valid address", "Invalid MOVR Address");
    return;
  }
  document.getElementById("requestBtn").innerHTML = '<div class="spinner-border" role="status"></div>'
  axios.post('./api/request', {
    address,
    amount,
    'g-recaptcha-response': recaptcha
  })
  .then(json => {
    if(json.data.success) {
      toastr.info(`${json.data.message}`, 'Transaction Sent');
      const receipt = json.data.receipt
      const quantity = json.data.amount
      const {blockHash, blockNumber, gasUsed, from, to, transactionHash} = receipt
      document.getElementById('blockHash').innerHTML = blockHash
      document.getElementById('blockNumber').innerHTML = blockNumber.toLocaleString()
      document.getElementById('gasUsed').innerHTML = gasUsed
      document.getElementById('from').innerHTML = from
      document.getElementById('to').innerHTML = to
      document.getElementById('transactionHash').innerHTML = transactionHash
      document.getElementById('quantity').innerHTML = quantity + " MOVR"

      document.getElementById("txUrl").innerHTML = `<a href="#" data-toggle="modal" data-target="#exampleModalCenter">View Transaction<a>`
      document.getElementById("requestBtn").disabled = false
      document.getElementById("requestBtn").innerHTML = "Submit"

    }
    if(!json.data.success) {
      toastr.error(json.data.message, "Something went wrong");
      document.getElementById("requestBtn").innerHTML = "Submit"
      document.getElementById("requestBtn").disabled = false
    }
  })
  .catch(console.log)
});


setInterval( () => {
  const address = document.getElementById("address").value
  if (!web3.utils.isAddress(address)) return
  axios.get(`./api/balance/${address}`)
    .then(response => {
      if (response.data.success) {
          document.getElementById('movrBalance').innerHTML = web3.utils.fromWei(response.data.data)
      }
    })
    .catch(error => {
      console.log(error)
    })
},2500)
