test:
	@echo "--> Running tests using the django test runner"
	./manage.py test cm

test-with-coverage:
	@echo "--> Running tests with coverage"
	coverage run ./manage.py test cm
	coverage report --include='src/cm/*' --omit='src/cm/tests/*'

clean:
	@echo "--> Cleaning up"
	find . -name "*.pyc" | xargs rm -f
	rm -rf .installed.cfg *.egg-info \
             bin/ develop-eggs/ eggs/ include/ lib/ local/ parts/ \
             pip-selfcheck.json .cache .coverage src/comt.egg-info *.egg

