var enviar = document.getElementById("enviar")
var resultado = document.getElementById("txtMedia")

enviar.addEventListener("click", function (event) {
  var altura01 = document.getElementById("altura").value
  var largura01 = document.getElementById("largura").value
  var select = document.getElementById("select")
  var operacao = select.options[select.selectedIndex].value
  var result = 0

  if (operacao == "branco") {
    result = (altura01 * largura01 * 1100) / 1000000
  } else if (operacao == "amadeirado") {
    result = (altura01 * largura01 * 1400) / 1000000
  } else {
    result = (altura01 * largura01 * 1100) / 1000000
  }
  document.getElementById("txtMedia").innerHTML =
    "Valor: R$" + result.toFixed(2).replace(".", ",")
})
