$(function () { // Same as document.addEventListener("DOMContentLoaded")...

	// Navbar toggler adjustments
	var navbarToggler = $("#navbar-toggler");
	var collapsableNav = $("#collapsable-nav");

	// Same as document.querySelector("#navbar-toggler").addEventListener("blur", ...)
	$(navbarToggler).blur(function (event) {
		var screenWidth = window.innerWidth;
		if (screenWidth < 768) {
			$(collapsableNav).collapse('hide');
		}
	});

	collapsableNav.on("show.bs.collapse", function() {
		navbarToggler.css({
			backgroundColor: "#E7E7E7",
		});
	});

	collapsableNav.on("hide.bs.collapse", function() {
		navbarToggler.css({
			backgroundColor: "",
		});
	});

	$(navbarToggler).click(function (event) {
		$(event.target).focus();
	  });

	$("a").focus(function (event) {
		this.style.boxShadow = "none";
	});

	$("a").click(function (event) {
		$(event.target).focus();
	  });

	// Single category page
});

// Dynamically Loading Content
(function (window) {
	var dc = {};

	var homeHtml = "snippets/home-snippet.html";
	var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
	var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	var categoryHtml = "snippets/category-snippet.html";
	var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
	var menuItemsTitleHtml = "snippets/menu-items-title-snippet.html";
	var menuItemHtml = "snippets/menu-items-snippet.html";

	// Convinient func for inserting innerHTML
	var insertHTML = function (selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	// Loading icon
	var showLoading = function (selector) {
		var html = "<div class='text-center mt-3'>";
		html += "<img src='images/ajax-loader.gif' id='loader'></div>";
		insertHTML(selector, html);
	};

	// Substitute {{propName}} for propValue
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	};

	var switchMenuToActive = function () {
		// Remove "active" from home btn
		var classess = document.querySelector("#nav-list li:first-child").className;
		classess = classess.replace(new RegExp("current", "g"), "");
		document.querySelector("#nav-list li:first-child").className = classess;
		// Add it to menu btn
		document.querySelector("#nav-list li:nth-child(2)").className += " current";
	};

	var adjustCard = function () {
		var cardImgWidth = $("#category-tiles .card-img").outerWidth();
		$("#category-tiles .price").css("width", (cardImgWidth - 2) + "px");
	};

	document.addEventListener("DOMContentLoaded", function (event) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest (homeHtml, function (responseText) {
			document.querySelector("#main-content").innerHTML = responseText;
		}, false);
	});

	dc.loadMenuCategories = function () {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHtml); // 'true' by default
	};

	dc.loadMenuItems = function (categoryShort) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort + ".json", buildAndShowMenuItemsHtml); // 'true' by default
	};



	function buildAndShowCategoriesHtml (categories) {
		$ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
			$ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml) {
				switchMenuToActive();

				var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
				insertHTML("#main-content", categoriesViewHtml);
			}, false);
		}, false);
	};

	function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
		var finalHtml = categoriesTitleHtml + "<section class='row' id='categories-tiles'>";

		for (var i = 0; i < categories.length; i++) {
			var html = categoryHtml;
			html = insertProperty(html, "name", "" + categories[i].name);
			html = insertProperty(html, "short_name", categories[i].short_name);
			finalHtml += html;
		};

		finalHtml += "</section>";
		return finalHtml;
	};

	function buildAndShowMenuItemsHtml(categoryMenuItems) {
		$ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
			$ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
				switchMenuToActive();

				var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
				insertHTML("#main-content", menuItemsViewHtml);
				adjustCard();
			}, false);
		}, false);
	};

	function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

		var finalHtml = menuItemsTitleHtml + "<section class='row' id='category-tiles'>";

		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			var html = menuItemHtml;
			html = insertProperty(html, "name", menuItems[i].name)
			html = insertProperty(html, "short_name", menuItems[i].short_name);
			html = insertProperty(html, "catShortName", catShortName);
			html = insertItemPrice(html, "price_small", menuItems[i].price_small);
			html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
			html = insertItemPrice(html, "price_large", menuItems[i].price_large);
			html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
			html = insertProperty(html, "menu", menuItems[i].name);
			html = insertProperty(html, "description", menuItems[i].description);
			finalHtml += html;
		};
	
		finalHtml += "</section>";
		return finalHtml;
	};

	function insertItemPrice(html, pricePropName, priceValue) {
		// if not specified, replace with empty string
		if (!priceValue) {
			return insertProperty(html, pricePropName, "");
		};

		priceValue = "$" + priceValue.toFixed(2);
		html = insertProperty(html, pricePropName, priceValue);
		return html;
	};

	function insertItemPortionName(html, portionPropName, portionValue) {
		// if not specified, replace with empty string
		if (!portionValue) {
			return insertProperty(html, portionPropName, "");
		};

		html = insertProperty(html, portionPropName, portionValue);
		return html;
	};

	window.$dc = dc;
})(window);