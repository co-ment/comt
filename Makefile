PKG=cm

test: test-unit test-e2e

test-unit:
	@echo "--> Running tests using the py.test runner"
	py.test $(PKG)

test-with-coverage:
	@echo "--> Running tests with coverage"
	py.test --cov $(PKG) --cov-config etc/coverage.rc $(PKG)

test-e2e:
	@echo "--> Running end-to-end tests using karma"
	tests/e2e/run-tests.py

run:
	@echo "--> Starting server"
	./manage.py runserver

lint:
	npm run lint --silent

develop:
	pip install -e .
	npm install karma karma-phantomjs-launcher karma-mocha
	npm install git://github.com/Siltaar/karma-e2e-dsl

clean:
	@echo "--> Cleaning up"
	find . -name "*.pyc" | xargs rm -f
	rm -rf .installed.cfg *.egg-info \
             bin/ develop-eggs/ eggs/ include/ lib/ local/ parts/ \
             pip-selfcheck.json 
	rm -rf .eggs .cache .coverage *.egg log

tidy: clean
	rm -rf .tox node_modules comt.db
