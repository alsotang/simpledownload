test:
	./node_modules/.bin/mocha --timeout 10000

test-cov:
	./node_modules/.bin/istanbul cover _mocha

.PHONY: test test-cov
