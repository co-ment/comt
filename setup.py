from setuptools import setup, find_packages

setup(
    name="comt",
    version="2.0a1",
    url='http://www.co-ment.org',
    license='AGPL3',
    description="Web-based Text Annotation Application.",
    author='Abilian SAS',
    author_email='dev@abilian.com',

    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=['setuptools'],
    zip_safe=False,
)
