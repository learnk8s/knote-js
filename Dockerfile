FROM adoptopenjdk:11-jre-openj9
RUN mkdir /opt/app
COPY target/*.jar /opt/app/app.jar
COPY bin/run.sh /opt/app/run.sh
RUN chmod a+x /opt/app/run.sh
RUN  apt-get update -y
RUN apt-get install unzip
CMD ["/opt/app/run.sh"]
