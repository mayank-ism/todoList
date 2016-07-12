from crontab import CronTab
import sys, logging

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)

def cronjob():
	cron = CronTab()
	api_request = 'curl http://127.0.0.1:5000/api/reminder'
	job = cron.new(command = api_request, 
	    comment = "Reminding all users of jobs to be completed today.")
	job.setall('0 0 * * *')
	job.run()

cronjob()
