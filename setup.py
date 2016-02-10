from setuptools import setup, find_packages
import os

description = os.popen("pandoc README.md -t rst").read()

setup(
    name="comt",
    use_scm_version=True,
    url='http://www.co-ment.org',
    license='AGPL3',
    description="Web-based Text Annotation Application.",
    long_description=description,
    author='Abilian SAS',
    author_email='dev@abilian.com',

    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=['setuptools'],
    zip_safe=False,
)
