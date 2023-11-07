module.exports.employee_check = (req, res, next) => {
	if (req.session.loggedin) {
		if (req.session.role == 'employee') {
			next();
		} else if (req.session.role == 'specialist') {
			res.redirect('/specialist');
		} else {
			res.redirect('/?logout=true');
		}
	} else {
		res.redirect('/?logout=true');
	}
}
module.exports.specialist_check = (req, res, next) => {
	if (req.session.loggedin) {
		if (req.session.role == 'employee') {
			res.redirect('/employee');
		} else if (req.session.role == 'specialist') {
			next();
		} else {
			res.redirect('/?logout=true');
		}
	} else {
		res.redirect('/?logout=true');
	}
}
