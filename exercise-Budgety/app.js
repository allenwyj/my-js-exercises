// Budget Controller
var budgetController = (function() {

    // Entities
    var Expense = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1; // when the expense is not defined, -1 is like a error code
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;
    }

    var Income = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    // our data structure to receive data.
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // expense/income, -1 indicates if there is no value existing
    };

    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(currentValue) {
            sum += currentValue.value;
        });

        data.totals[type] = sum;
    };

    return {

        addItem: function(type, des, val) {
            var lastItemID, newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                // find the last item in the array and get its id.
                lastItemID = data.allItems[type][data.allItems[type].length - 1].id;
                ID = parseInt(lastItemID) + 1;
            } else {
                ID = 0;
            }

            // create item based on their type 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // add item to the correct array
            // type will be 'inc' or 'exp'
            data.allItems[type].push(newItem);

            // return the new element, because of changing the UI.
            return newItem;
        },

        deleteItem: function(type, ID) {
            var ids, index;

            // mapping all elements in the arrays, and
            // storing all of its id following its element index.
            ids = data.allItems[type].map(function(current) {
                return current.id; 
            });

            // using the ID to get its index.
            // if ID is not found, indexof will return -1.
            index = ids.indexOf(ID)

            if (index !== -1) {
                // remove item from the data array
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // calculate totals
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentages.
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {

            // looping each expense and calculate the percentage
            data.allItems.exp.forEach(function(currentValue) {
                currentValue.calculatePercentage(data.totals.inc);

            });

        },

        getPercentage: function() {

            var allPercentages = data.allItems.exp.map(function(currentValue) {
                return currentValue.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        // for debug, check the data structure
        testing: function() {
            return data.allItems;
        }
    }

})();

// UI Controller
var UIController = (function() {

    // storing UI elements
    var DOMStrings = {
        inputType: '.add__type', // type input selection
        inputDesc: '.add__description', // desc input field
        inputValue: '.add__value', // value input field
        inputBtn: '.add__btn', // the add button
        incomeContainer: '.income__list', // income list class
        expenseContainer: '.expenses__list', // expense list class
        budgetLabel: '.budget__value', // display budget label class
        incomeLabel: '.budget__income--value', // display income class
        expensesLabel: '.budget__expenses--value', // display expenses class
        percentageLabel: '.budget__expenses--percentage', // display percentage class
        expensePercentageLabel: '.item__percentage', // display expense's percentage class
        dateLabel: '.budget__title--month',
        container: '.container'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        // returning an absolute number
        num = Math.abs(num);
        // giving 2 decimal numbers and return its value as a string
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        // adding thousand seperator
        /**
            if(int.length>3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);

            }
            **/
        int =  int.replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

        dec = numSplit[1];

        // adding '+' or '-' 
        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    };

    /** loop over the nodeList, and for each item in the list
        * performs the business logic in our callback function.
        * callback function has currentElement and its index as the arguments. **/
    var nodeListForEach = function(list, callback) {

        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // return input from UI
        getInput: function() {

            // returning all input values
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value) // convert string to float.
            };
        },

        // getting the new added item and add it to UI list
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html code into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        // removing element from DOM
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        // clear the user input field to empty after user hits enter or 'save'
        clearField: function() {
            var fields, fieldsArr;

            // querySelectorAll fetches the HTML elements that we want
            // and store them into a list
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);
            // convert the list into an Array
            fieldsArr = Array.prototype.slice.call(fields);

            // the elements of fields or fieldsArr are references which points to the same location
            // so we can set them to empty string "", to change the HTML (clear fields)
            fieldsArr.forEach(function(currentValue){
                currentValue.value = "";
            });

            // focus on the description field after saving.
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage !== -1) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = 'n.a';
            }

        },

        displayPercentage: function(percentage) {

            // select all elements which has class name: item__percentage
            var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '-';
                }

            });
        },

        displayMonth: function() {

            var now, year, month, months;
            // return the current time without any argument.
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        // changing the color based on 'inc' or 'exp'
        changeType: function() {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDesc + ',' +
                DOMStrings.inputValue
            );

            // change the selection, desc, value based on the type.
            // the second parameter in callback function is optional
            nodeListForEach(fields, function(currentValue) {
                console.log(arguments);
                currentValue.classList.toggle('red-focus');
            });

            // change the btn color depends on the type.
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        // return UI elements class.
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();

// App Controller
var controller = (function(budgetCtrl, UICtrl) {

    // put all event listener inside a function.
    var setupEventListener = function() {
        // getting ui element class name.
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // adding a global listener
        document.addEventListener('keypress', function(event) {
            // check if the pressed key is the 'Enter'
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function() {

        // calculate the budget.
        budgetCtrl.calculateBudget();

        // get it from the budget controller
        var budget = budgetCtrl.getBudget();

        // display the budget.
        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function() {

        // calculate the percentage
        budgetCtrl.calculatePercentage();

        // get it from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // display the percentage on the UI
        UICtrl.displayPercentage(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        // get the field input data
        input = UICtrl.getInput();

        // only record with desc is not empty and value positive number can be saved
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearField();

            // calculate and update budget
            updateBudget();

            // update the percentage
            updatePercentage();
        }
    };

    // handle the deletiong of item when user clicks the delete button.
    var ctrlDeleteItem = function(event) {
        var itemID, type, ID;

        // getting the id from the 4 levels uppers element id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // split the element id, get type: 'inc' or 'exp' and get the id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from the data
            budgetCtrl.deleteItem(type, ID);

            // delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // update and show the new budget
            updateBudget();

            // update the percentage
            updatePercentage();

        }
    };

    return {
        init: function() {
            console.log('Application has started.');

            // init the page
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();