(->
	return if location.hostname is 's3.amazonaws.com' and location.protocol is 'https:'
	
	# ensure we are at the correct domain
	if location.hostname isnt 's3.amazonaws.com'
		location.href = '/admin/' # send to redirect page which will take to admin-bucket
	else if location.protocol isnt 'https:'
		location.protocol = 'https:'
	
	# stop other javascript from running
	throw new Error('Cannot administer site from this location. Redirecting...')
)()