$(document).ready(function(){
	//register two buttons
	$("#recipeViewButton").click(viewRecipe);
	$("#recipeSubmitButton").click(sendRecipe);
	
	getRecipeList();
});

	//populate the recipe list dropdown by requesting data from the server
	//adds a bunch of: <option value="recipe_name.json">recipe name</option>	
function getRecipeList(){
	console.log("Requesting all recipe names");
	
	//request list of names
	$.ajax({method: "GET", 
				url: "/recipes",
				dataType:"json",
				success:function(data){
					//data is expected to an object like...
					//{names: [name1, name2, ...]}
								
					if(data.names && data.names.length>0){  //non empty list?
						
						var $dropdown = $("#recipeSelect");
						$dropdown.html('');//clear dropdown
						
						//populate dropdown
						for(var i=0;i<data.names.length;i++){
							$dropdown.append("<option value='"+data.names[i]+"'>"
															+data.names[i].split("_").join(" ")
															+"</option>");
						}
					}
				}
	});
}

function viewRecipe(){
	
	var name = $("#recipeSelect option:selected").val();  //get the value of the selected option from recipeSelect
	console.log("Requesting recipe: "+name);
	//fetch and load the recipe
	$.ajax({method:"GET",
				url: "/recipe/"+name,
				dataType:"json",
				success: function(data){
					console.log("Loading recipe into form: ",data);
					//fill in form		
					$("#recipeName").val(data.name.split("_").join(" "));
					$("#recipeDuration").val(data.duration);
					$("#recipeIngredients").val(data.ingredients.join("\n"));
					$("#recipeDirections").val(data.directions.join("\n"));
					$("#recipeNotes").val(data.notes);
				},
				cache:false
	});
}

function sendRecipe(){
	console.log("Sending new recipe");
	
	//get recipe from page
	var recipe = {
		name: $("#recipeName").val().split(" ").join("_"),
		duration: $("#recipeDuration").val(),
		ingredients: $("#recipeIngredients").val().split("\n"),
		directions: $("#recipeDirections").val().split("\n"),
		notes: $("#recipeNotes").val()
	}
	
	//send recipe
	$.ajax({method:"POST",
				url:"/recipe",
				data:recipe,
				success:function(data){
					//show/hide checkmark div
					document.querySelector("#confirmed").style.display="inline";
					setTimeout(function(){
						document.querySelector("#confirmed").style.display="none";
					},3000);
					getRecipeList();  //refresh dropdown
				}
	});
}
