$(document).ready(function(){
  $("#login").click(login);
})

function login(){
	var user = {username: $("#username").val(), password: $("#password").val()};
	
	$.ajax({
		method: "POST", 
		url: "/login",
		data: JSON.stringify(user),
		contentType: 'application/json',
		success:function(data){
			location.href="./index";
		}
	});
}