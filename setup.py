from setuptools import setup, find_packages

setup(
    name = "comt",
    version = "2.0-alpha1",
    url = 'http://www.co-ment.org',
    license = 'AGPL3',
    description = "Web-based Text Annotation Application.",
    author = 'Sopinspace',
    author_email = 'dev@sopinspace.com',
    packages = find_packages('src'),
    package_dir = {'': 'src'},
    install_requires = ['setuptools'],
)

