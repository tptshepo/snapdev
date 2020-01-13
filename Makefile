.PHONY: deploy build set_version  

NEW_VERSION := 1.5.2

set_version:
	npm --no-git-tag-version --allow-same-version version $(NEW_VERSION)

deploy: set_version
	npm publish	
	
.DEFAULT_GOAL := deploy