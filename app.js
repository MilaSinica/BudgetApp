//Structure: module pattern. Powerful and simple. Each module variables are private. Separated and structured code. No other code overrates our data. 
//Some methods are public so other modules can use it - THIS DATA ENCAPSULATION.
//we separate UI from data, so they are completely independent. So we can easily change the project in the future. They will be connected with 3rd module - app controller
//***************************1st module - BUDGET****************************************
var budgetController = (function(){ //IFIS function - immedately invoced function helps to preserve data privacy, can`t be accessed from the outside
    var Expense = function(id, description, value) {//constructor 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; //use -1 when it`s not defined
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if (totalInc > 0){
            this.percentage = Math.round(this.value /totalInc * 100);  
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value) {//constructor 
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculate total income and expense
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){ //curr is exp or income array value in a loop
            sum += curr.value;
        }); 
        data.totals[type] = sum;       
    };

    var data = { //objects inside objects structure all budget data. 
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //doesn`t exist at this point thats why not 0, but -1
    };

    
    return { //Module pattern - return object containing all the function we want to be public - give access to
        addItem: function(type, desc, val){ //function works thanks to Closure was created here
            var newItem, ID;
            
            //create new ID - unique number we want to put to a newly created expense or income. We specify it as last ID +1 so we track correct ID despite deleting previous ids
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;//selects the last item`s id in the array exp or inc (this is chosen by type), increments it by 1 to create a new unique ID 
            } else {
                ID = 0;
            }

            //creates new item based on inc or exp type
            if (type === "exp"){
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc"){
                newItem = new Income(ID, desc, val);
            };

            //push new item to our data structure
            data.allItems[type].push(newItem); //we could use if to determine where to push new item(expenses or income), however as long 
            //as we have same name for array and type parametr (inc and exp), we simply use it to select correct array
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            //loop through income/exoense array and retrieve their ids into nw array
            ids = data.allItems[type].map(function(current){//map is loop method similar to forEach, has access to cur val, index and array. It returns brand new array
                return current.id;
            });
            //save index of defined id in the array of all ids into var
            index = ids.indexOf(id);//returns index number of an element in the array. If not found --> index = -1
            
            //if id is found remove it
            if (index !== -1){ //If not found --> index = -1
                data.allItems[type].splice(index, 1);//splice array method used to remove elements from array (position, number of elements to remove)
            }

        },

        calculateBudget: function(){
            //calculate total income and expense
            calculateTotal("exp");
            calculateTotal("inc");
            //calculate budget inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0){ //can`t divide by 0
                //calculate % of exp in income 
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); //round to the percentage
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function(){
            var allPercentages = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPercentages;
        },

        //retrieve data about budget
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        } 
    };
})();


//***************************2nd module - USER INTERFACE************************************
var UIController = (function(){
    var DOMstrings = { //contains class names so we can easily change them if needed in only one place. No hardcoded strings
        inputType: ".add__type", 
        inputDescr: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function(num, type){
        var num, numSplit, int, dec, sign;
        //  + or -, 2 decimals, coma separate thousands: 23424,5566 --> +23,435.56
        num = Math.abs(num);// abs method gets rid of sign, we store only absolute number in var
        num = num.toFixed(2);//number method to round number to n symbols after coma
        numSplit = num.split(".");//method  devides number to two parts: decimals and absolte part and store into array [absolute, decimals]
        int = numSplit[0]; //absolute part
        dec = numSplit[1]//decimal part
        if (int.length > 3){ //puttimg come between thousands
            var intThousLengt = int.length - 3;
            int = int.substr(0, intThousLengt) + "," + int.substr(intThousLengt, 3);//string method substr returns part of the string we define
        }
        type === "inc" ? sign = "+" : sign = "-"; //if statement (ternary operator for sign)
        
        return sign + " " + int + "." + dec; //or  (type === "inc" ? "+" : "-") + " " + int + dec;
    };

    //our created forEach function, which works with lists (not arrays)
    var nodelistForEach = function(list, callbackFunc){
        for (var i = 0; i < list.length; i++){
            callbackFunc(list[i], i);
        }
    };

    return {
        //gets data from the input fields
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp 
                description: document.querySelector(DOMstrings.inputDescr).value, //what user iputs
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //what user iputs, parsefloat method turns string from user input to number with decumals
            };
        },

        //adds new expense or income item to the list in the DOM
        addListItem: function(obj, type){
            var html, newhtml, element;

            //create HMMP placeholder string
            if (type === "inc"){//%id% - %symbol so we can easier find it in the text
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === "exp"){
                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            };

            //Replace placeholder with actual information
            newhtml = html.replace("%id%", obj.id); //replace method relplaces selected information with given text
            newhtml = newhtml.replace("%description%", obj.description); //we use newhtml now, because it already contains changed id value
            newhtml = newhtml.replace("%value%", formatNumber(obj.value, type));

            //Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newhtml); //we can insert html before/after(sibling) element or before/after(child) content inside selected container using method insertAdjacentHTML properties
        },

        deleteListItem: function(selectorID){//we use actual DOM ID to delete item form the DOM
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);//we can delete element from the dom only as a child not directly, that`s why we use parentNode method
        },

        //empty input fields after inc or exp is added to the list
        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescr + "," + DOMstrings.inputValue); //selectall returns list, no array
            fieldsArray = Array.prototype.slice.call(fields); //this is trick to convert list to an actual array
            fieldsArray.forEach(function(current, index, array){ //this function is used for each array value
                current.value = "";
            });
            fieldsArray[0].focus(); //this method focus puts coursour focus to the specified input field
        },

        //display total budget sums in the DOM
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage < 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            };
        },

        displayPercentages: function(percent){
            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel); //returs nodelist not array
            
            nodelistForEach(fields, function(curr, index){
                if (percent[index] > 0){
                    curr.textContent = percent[index] + "%";
                } else {
                    curr.textContent = "---";
                }
            });

        },

        displayMonth: function(){
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];            
            now = new Date();//returns date of today or var christmas = new Date(2018, 12, 25)
            year = now.getFullYear(); //returns from date prototype its year property
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },

        //when expense are changed from "+" to "-" inout border light is changed from blue to red
        changedType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + "," 
                                                + DOMstrings.inputDescr + ","
                                                + DOMstrings.inputValue); //returns node list

            nodelistForEach(fields, function(curr){
                curr.classList.toggle("red-focus");//each time type changes, we change class of the elements
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");//changes btn
        },

        //public method to select DOM element using their class saved inside this object
        getDOMstrings: function(){
            return DOMstrings;
        }
       
    };
//
})();

//***************************3rd module - APP CONTROLLER***************************************** 
var controller = (function(bdgCtrl, UICtrl){ //receives other modules as argument to connect them and let cowork together despite their independancy
    
    //event delegation: all parents elements know about target element event (event bubbling). That is why we can use event handler inside parent element and refer to its child
    //we use event delegation: 1)if we have a lot of child elements we are interested in; 2)if the target element is not yest in the DOM when page is loaded
    function setupEventListeners(){ //stores all events
        //all DOM strings (name-selectors stored inside)
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        //function works global on the whole document, it follows if the key is pressed in any moment, because we have only one place where user can enter information
        document.addEventListener("keypress", function(event){ //Keypress works for any key press. To make it specific to Enter: use argument to send specific KEY CODE
            if(event.keyCode === 13 || event.which === 13){ //event is an object which has different properties. Key code is one of them, it shows code of every specific keybord buttons. .which is used in older browsers
                ctrlAddItem();
            }
        });

        //when "x" buttons is clicked on some list items, we target event in parent container to delete this item
        document.querySelector(DOM.container).addEventListener("click", ctrDeleteItem);//we use container for event delegation as common container for all list items
    
        //when expense are changed from "+" to "-" inout border light is changed from blue to red
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updatePercentage = function(){
        //calculate percentages
        bdgCtrl.calculatePercentages();
        //read them from the budget controller
        var percentages = bdgCtrl.getPercentage();
        //update UI
        UIController.displayPercentages(percentages);
    }

    var updateBudget = function(){
        //calculate the budget
        bdgCtrl.calculateBudget();
        //return the budget
        var budget = bdgCtrl.getBudget();
        //display the budget on UI
        UICtrl.displayBudget(budget);
    };

    //when user adds new item and press enter or add button
    var ctrlAddItem = function (){
        var input, newItem;
        //get the field input data
        input = UICtrl.getInput();
        //before adding new item we check if input has some values inside
        if (input.description != "" && !isNaN(input.value) && input.value > 0){ //isNan method checks if input is number or not
            //add item to the budget controller
            newItem = bdgCtrl.addItem(input.type, input.description, input.value);
            //add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //clear input fields
            UICtrl.clearFields();
            //calculate and update budget
            updateBudget();
            //update percentages
            updatePercentage();
        };
    };

    //on click delete item from the list
    var ctrDeleteItem = function(event){
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; //DOM traversing - we clicked on child element, but actually we need id of the 4th parent nod of the event target element
        
        //only if element has id (because HTML doc is written so that only list items have ids)
        if (itemId){

            //id = inc-1
            splitId = itemId.split("-");//split is method which returns array of elements, where the elements are strings separated by defined symbol
            type = splitId[0];
            id = parseInt(splitId[1]);

            //delete item from data structure
            bdgCtrl.deleteItem(type, id);
            //delete item from UI
            UICtrl.deleteListItem(itemId);
            //update totals and budget
            updateBudget();
            //update percentages
            updatePercentage();
        };
    };

    return {
        //public initialization function
        
        init: function(){
            UICtrl.displayMonth();

            //clears all budget fields
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }); //passing similar obj with everything set to zero to clear all fields
            
            setupEventListeners();
        }
    };
  
})(budgetController, UIController);//pass other modules as arguments

//only code outside controlles, initializing app
controller.init();