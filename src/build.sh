#!/bin/sh

OUTPUT_PATH=${OUTPUT_PATH:-output}

yum install -y git
cp -a /usr/bin/git ${OUTPUT_PATH}
cp -a /usr/libexec/git-core/git-remote-https ${OUTPUT_PATH}
cp -a /usr/libexec/git-core/git-remote-http ${OUTPUT_PATH}
cp -a /usr/share/git-core ${OUTPUT_PATH}
