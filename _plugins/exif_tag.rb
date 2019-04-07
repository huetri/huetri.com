
# -*- coding: utf-8 -*-
# A Liquid tag rof Jekyll sites that allows showing exif data.
# by: Gosuke Miyashita
#
# Example usage: {% exif /images/sample.jpg %}

require 'exiftool'

module Jekyll
  class ExifTag < Liquid::Block
    def initialize(tag_name, path_var, token)
      super
      @path_var = path_var 
    end

    def render(context)
      if not(context.key?(@path_var))
        return ""
      end
      path = context[@path_var]
      path = ".." + path
      file = File.expand_path path , File.dirname(__FILE__)

      exif = Exiftool.new(file)
      exif = exif.to_hash
      context.environments.first['model'] = exif[:model]
      context.environments.first['aperture_value'] = exif[:aperture_value]
      context.environments.first['exposure_time'] = exif[:exposure_time]
      context.environments.first['copyright'] = exif[:copyright]
      context.environments.first['focal_length'] = exif[:focal_length]
      context.environments.first['shutter_speed_value'] = exif[:shutter_speed_value]
      super
    end
  end
end

Liquid::Template.register_tag('exif', Jekyll::ExifTag)