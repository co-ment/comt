test:
	@echo "--> Running tests using the django test runner"
	bin/django test cm --settings=settings
	#@echo "--> This won't work currently. Please FIXME."
	#PYTHONPATH=src py.test src/cm/tests

clean:
	@echo "--> Cleaning up"
	find . -name "*.pyc" | xargs rm -f
	rm -rf .installed.cfg *.egg-info \
             bin/ develop-eggs/ eggs/ include/ lib/ local/ parts/ \
             pip-selfcheck.json 

