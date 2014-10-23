/** @jsx React.DOM */

var $update = React.addons.update;

var fieldsNotShowable = ["puma", "first_ancestry", "sex", "occupation", "education", "id", "broad_race", "transport_to_work", "education_group"];

var axisFields = ["personal_income", "age", "weight", "sex", "citizen"];

var fieldDisplayNames = {
	"personal_income": "income",
	"has_health_insurance": "has health insurance",
	"occupation_group": "job category",
	"hours_worked_per_week": "avg. hours worked / week",
	"year_of_entry": "year of entry into US",
	"veteran_service": "veteran status",
	"lang_other_than_english_at_home": "speaks a language other than English at home",
	"area_of_birth": "area of birth"
}

function displayNameForField(field) {
	if (fieldDisplayNames[field]) {
		return fieldDisplayNames[field];
	}
	return field;
}

function computePosOnAxisForPeopleAndReturnLabels(axis, people, existing, xAxisNotY) {
	var labels = [];

	var groups = {};
	var i = 0;
	people.forEach(function(person) {
		var group = person[axis];
		if (group === null) {
			group = "None";
		} else if (!isNaN(parseFloat(group))) {
			group = "Numbers";
		}
		if (!groups[group]) groups[group] = [];
		groups[group].push(i++);
	})
	var numbersMin = 0;
	var numbersMax = 0;
	if (groups["Numbers"]) {
		numbersMin = parseFloat(people[groups["Numbers"][0]][axis]);
		numbersMax = numbersMin;
		groups["Numbers"].forEach(function(i) {
			var x = parseFloat(people[i][axis]);
			numbersMin = Math.min(numbersMin, x);
			numbersMax = Math.max(numbersMax, x);
		});
		if (numbersMin == numbersMax) {
			numbersMax++;
		}
	}
	var start = 0;
	Object.keys(groups).forEach(function(group) {
		var end = start + groups[group].length / people.length;
		groups[group].forEach(function(i) {
			var person = people[i];
			var pos = start + (end-start) * existing[i];
			if (group == "Numbers") {
				var t = (parseFloat(person[axis]) - numbersMin) / (numbersMax - numbersMin);
				pos = start + (end-start) * t
			}
			existing[i] = pos;
		});

		var leftLabelStyle = {};
		leftLabelStyle[xAxisNotY ? "left" : "top"] = start*100+"%";
		leftLabelStyle[xAxisNotY ? "borderLeft" : "borderTop"] = '1px solid black';
		var leftLabelText = (group == 'Numbers') ? numbersMin : group;
		var leftLabel = <div style={leftLabelStyle}>{leftLabelText}</div>;
		labels.push(leftLabel);

		if (group == 'Numbers') {
			var rightLabelStyle = {borderRight: '1px solid black'};
			rightLabelStyle[xAxisNotY ? "right" : "bottom"] = (1-end)*100+"%";
			rightLabelStyle[xAxisNotY ? "borderRight" : "borderBottom"] = '1px solid black';
			var rightLabelText = numbersMax;
			var rightLabel = <div style={rightLabelStyle}>{rightLabelText}</div>;
			labels.push(rightLabel);
		}

		start = end;
	})
	var labelClass = xAxisNotY ? "xAxisLabel" : "yAxisLabel";
	return <div className={labelClass}>{labels}</div>
}

var Map = React.createClass({
	getInitialState: function() {
		return {showFields: [], arrange: {type: 'random'}}
	},
	render: function() {
		var self = this;
		var fields = Object.keys(self.props.people[0]).filter(function(f) {
			return fieldsNotShowable.indexOf(f) == -1;
		});
		var changedSelectedFields = function(selected) {
			self.setState($update(self.state, {showFields: {$set: selected}}));
		}
		var xSelectedIndex = null;
		var ySelectedIndex = null;
		if (self.state.arrange.type == 'xy') {
			xSelectedIndex = self.state.arrange.xAxisIndex;
			ySelectedIndex = self.state.arrange.yAxisIndex;
		}
		var stateWithEnsuredXYArrangement = function() {
			if (self.state.arrange.type != 'xy') {
				return $update(self.state, {arrange: {$set: {type: 'xy', xAxisIndex: null, yAxisIndex: null}}});
			} else {
				return self.state;
			}
		}
		var selectedXAxisIndex = function(i) {
			self.setState($update(stateWithEnsuredXYArrangement(), {arrange: {xAxisIndex: {$set: i}}}));
		}
		var selectedYAxisIndex = function(i) {
			self.setState($update(stateWithEnsuredXYArrangement(), {arrange: {yAxisIndex: {$set: i}}}));
		}
		var xAxisControls = <div className='x axis'>X axis <SegmentedControl segments={axisFields} selectedIndex={xSelectedIndex} onSelectedIndex={selectedXAxisIndex}/></div>
		var yAxisControls = <div className='y axis'>Y axis <SegmentedControl segments={axisFields} selectedIndex={ySelectedIndex} onSelectedIndex={selectedYAxisIndex}/></div>
					
		return <div>
					{self.renderPeople()}
					<div id='controls'>
						<div className='floating' style={{top: '30px', left: '60px'}}>
							{xAxisControls}
						</div>
						<div className='floating' style={{bottom: '30px', left: '30px'}}>
							{yAxisControls}
						</div>
						<div className='floating' style={{right: '30px', bottom: '30px'}}>
							<Checkboxes options={fields} selectedOptions={self.state.showFields} onSelectedOptionsChanged={changedSelectedFields}/>
						</div>
					</div>
			   </div>
	},
	renderPeople: function() {
		var self = this;
		var xPositions = self.props.people.map(function(person) {
			return (person.id.toString().hashCode() % 10000)/10000;
		})
		var xAxisLabel = <div></div>
		var yPositions = self.props.people.map(function(person) {
			return (("7" + person.id.toString()).hashCode() % 10000)/10000;
		})
		var yAxisLabel = <div></div>
		if (self.state.arrange.type == 'xy') {
			if (self.state.arrange.xAxisIndex !== null) {
				xAxisLabel = computePosOnAxisForPeopleAndReturnLabels(axisFields[self.state.arrange.xAxisIndex], self.props.people, xPositions, true);
			}
			if (self.state.arrange.yAxisIndex !== null) {
				yAxisLabel = computePosOnAxisForPeopleAndReturnLabels(axisFields[self.state.arrange.yAxisIndex], self.props.people, yPositions, false);
			}
		}
		var i = 0;
		var people = this.props.people.map(function(person) {
			var index = i++;
			return <Person key={person.id} person={person} showFields={self.state.showFields} xPos={xPositions[index]} yPos={yPositions[index]}/>
		})
		return <div>
					{people}
					{xAxisLabel}
					{yAxisLabel}
				</div>
	}
});

var Checkboxes = React.createClass({
	render: function() {
		var self = this;
		var boxes = self.props.options.map(function(option) {
			var checked = self.props.selectedOptions.indexOf(option) != -1;
			var toggle = function() {
				var selected = self.props.selectedOptions.slice();
				if (selected.indexOf(option) == -1) {
					selected.push(option);
				} else {
					selected.splice(selected.indexOf(option), 1);
				}
				self.props.onSelectedOptionsChanged(selected);
			}
			return <div key={option}> <input type='checkbox' checked={checked} onChange={toggle}/>{displayNameForField(option)} </div>
		})
		return <div className='checkboxes'>{boxes}</div>
	}
})

var SegmentedControl = React.createClass({
	render: function() {
		var self = this;
		var i = 0;
		var segments = self.props.segments.map(function(seg) {
			var index = i++;
			var className = (index == self.props.selectedIndex) ? "selected" : "";
			var selected = function() {
				self.props.onSelectedIndex(index == self.props.selectedIndex ? null : index);
			}
			return <li key={seg} className={className} onClick={selected}>{displayNameForField(seg)}</li>
		})
		return <ul className='segmentedControl'>{segments}</ul>
	}
})

var transformProp = 'transform';

var Person = React.createClass({
	render: function() {
		var self = this;

		var children = [];
		if (self.props.showFields.indexOf('has_health_insurance') != -1) {
			var style = {opacity: self.props.person.has_health_insurance == 'Insured' ? 1 : 0.3};
			var c = <span className='fa fa-medkit' style={style}></span>
			children.push(c);
		}
		if (self.props.showFields.indexOf('area_of_birth') != -1) {
			var c = <span className='area-of-birth'>{self.props.person.area_of_birth}</span>
			children.push(c);
		}
		var avatarStyle = {};
		var scaleX = 1;
		var scaleY = 1;
		if (self.props.showFields.indexOf('weight') != -1) {
			scaleX *= (self.props.person.weight ? self.props.person.weight : 120) / 120;
		}
		if (self.props.showFields.indexOf('age') != -1) {
			var s = (self.props.person.age ? self.props.person.age : 40) / 40 * 0.6 + 0.3;
			scaleY *= s;
			scaleX *= s;
			var c = <span className='age'>{self.props.person.age}</span>
			children.push(c);
		}
		avatarStyle[transformProp] = "scale(" + scaleX + ", " + scaleY + ")";

		if (self.props.showFields.indexOf('lang_other_than_english_at_home') != -1) {
			var style = {opacity: self.props.person.lang_other_than_english_at_home == 'Yes' ? 1.0 : 0.3};
			var c = <span className='fa fa-language' style={style}></span>
			children.push(c);
		}

		if (self.props.showFields.indexOf('hours_worked_per_week') != -1) {
			if (self.props.person.hours_worked_per_week) {
				var c = <span className='hours_worked_per_week fa fa-clock-o'>{self.props.person.hours_worked_per_week}</span>
				children.push(c);
			}
		}

		if (self.props.showFields.indexOf('married') != -1) {
			var className = "fa-heart-o";
			var m = self.props.person.married;
			if (m == 'married') {
				className = 'fa-heart';
			} else if (m == 'widowed') {
				className = 'fa-close';
			}
			className += " fa marriage";
			var c = <span className={className}></span>
			children.push(c);
		}

		var addOrdinaryField = function(field) {
			if (self.props.showFields.indexOf(field) != -1) {
				if (self.props.person[field]) {
					var c = <span className={field}>{self.props.person[field]}</span>
					children.push(c);
				}
			}
		}

		addOrdinaryField('year_of_entry');
		addOrdinaryField('veteran_service');

		if (self.props.showFields.indexOf('occupation_group') != -1) {
			var icons = {
				manager: 'fa-briefcase',
				businessperson: 'fa-bar-chart',
				finance: 'fa-money',
				'computers/math': 'fa-desktop',
				engineer: 'fa-cubes',
				scientist: 'fa-flask',
				'religious/social worker': 'fa-heart',
				legal: 'fa-legal',
				educator: 'fa-graduation-cap',
				entertainment: 'fa-film',
				medicine: 'fa-user-md',
				'healthcare support': 'fa-hospital',
				'protective services (police/fire, etc)': 'fa-fire-extinguisher',
				'food worker': 'fa-spoon',
				cleaner: 'fa-tint',
				'personal care and service': 'fa-thumbs-up',
				sales: 'fa-tags',
				'office worker': 'fa-building',
				'farm worker': 'fa-leaf',
				'construction-related worker': 'fa-gear',
				'miner': 'fa-fire',
				'installation, maintainance and repair': 'fa-wrench',
				'production worker': 'fa-gears',
				'transportation': 'fa-bus',
				military: 'fa-space-shuttle'
			}
			var className = icons[self.props.person.occupation_group] ? 'fa ' + icons[self.props.person.occupation_group] : '';
			var c = <span className={className}></span>
			children.push(c);
		}

		if (self.props.showFields.indexOf("citizen") != -1) {
			var icons = {
				"US-born": "fa-flag",
				"US-territory-born": "fa-flag",
				 "born abroad to US parents": "fa-flag", 
				 "naturalized": "fa-flag-checkered",
				 "non-citizen": "fa-flag-o"
			}
			if (self.props.person.citizen) {
				var className = icons[self.props.person.citizen];
				var c = <span className={'fa '+className}></span>
				children.push(c);
			}
		}

		var avatarClass = (self.props.person.sex == 'male' || (!self.props.person.sex && Math.random() > 0.5)) ? 'avatar fa fa-male' : 'avatar fa fa-female';
		var style = {
			left: self.props.xPos * 100 + "%",
			top: self.props.yPos * 100 + "%"
		}
		return <div className='person' style={style}>
					<div className={avatarClass} style={avatarStyle}></div>
					{children}
			   </div>
	}
});

var PUMAPolygons = null;

$.ajax({
	url: "nyc-sample-100.json",
	success: function(people) {

		var i=0;
		people.forEach(function(person) {
			person.id = i++;
		})
		React.renderComponent(<Map people={people} />, document.getElementById('main'));
	}
})

String.prototype.hashCode = function() {
	var str = this;
    var i, l,
        hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
};


